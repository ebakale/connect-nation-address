# Diagramas de Flujo de Procesos - Sistema ConnectNation Address

## 1. Flujo Unificado de Solicitud de Direcciones

### Flujo de Solicitud de Direcciones Multi-Propósito

```
Inicio
  ↓
Usuario inicia sesión en Portal Ciudadano
  ↓
Usuario accede a Solicitud Unificada de Direcciones
  ↓
Selecciona tipo de solicitud:
  ├── "Declarar Dirección Existente" (CAR)
  ├── "Registrar Negocio" 
  └── "Solicitar Nueva Dirección" (NAR)
  ↓
┌─────────────────────────────────────────┐
│ PASO 1: BÚSQUEDA DE DIRECCIÓN           │
├─────────────────────────────────────────┤
│ Opciones de búsqueda:                   │
│   ├── Buscar por código UAC             │
│   ├── Buscar por ubicación/mapa         │
│   └── Navegar direcciones verificadas   │
│                                         │
│ Resultado:                              │
│   ├── Dirección encontrada → Continuar  │
│   └── No encontrada → Crear solicitud   │
└─────────────────────────────────────────┘
  ↓
¿Dirección encontrada?
  ├── SÍ → Proceder al Paso 2
  └── NO → Flujo de solicitud NAR (ver Sección 2)
  ↓
┌─────────────────────────────────────────┐
│ PASO 2: DECLARACIÓN/REGISTRO            │
├─────────────────────────────────────────┤
│ Para Declaración CAR:                   │
│   ├── Seleccionar: Primaria o Secundaria│
│   ├── Elegir alcance: EDIFICIO o UNIDAD │
│   ├── Ingresar unit_uac (si UNIDAD)     │
│   ├── Establecer nivel de privacidad    │
│   └── Enviar declaración                │
│                                         │
│ Para Registro de Negocio:               │
│   ├── Ingresar nombre de organización   │
│   ├── Seleccionar categoría de negocio  │
│   ├── Agregar información de contacto   │
│   ├── Especificar horarios de operación │
│   └── Enviar para aprobación            │
└─────────────────────────────────────────┘
  ↓
Sistema procesa solicitud
  ↓
¿Tipo de solicitud?
  ├── Declaración CAR → Verificación auto-aprobación
  └── Negocio → Requiere revisión manual
  ↓
Para CAR: trigger_auto_approve_citizen_address()
  ├── ¿UAC en NAR verificado?
  │   ├── SÍ → Estado: CONFIRMED (instantáneo)
  │   │         log_auto_approval_event() registra evento
  │   └── NO → Estado: SELF_DECLARED (revisión manual)
  ↓
Usuario recibe notificación
  ↓
Fin
```

## 2. Proceso NAR (Registro Nacional de Direcciones)

### Flujo de Creación de Direcciones

```
Inicio
  ↓
Fuente de solicitud:
  ├── Agente de Campo → Envía via AddressCaptureForm
  └── Ciudadano → Envía via Solicitud Unificada
  ↓
Todas las solicitudes van a tabla address_requests
  ├── Estado: 'pending'
  ├── Coordenadas GPS capturadas
  ├── Fotos subidas
  └── Detalles de dirección registrados
  ↓
Sistema realiza verificaciones automáticas
  ├── Validación de coordenadas (dentro de límites del país)
  ├── Análisis de calidad de fotos (via analyze-photo-quality)
  ├── Detección de duplicados (via check_address_duplicates())
  └── Cálculo de puntaje de completitud
  ↓
¿Resultado de auto-verificación?
  ├── APROBADO (puntaje ≥ 70) → Cola de revisión estándar
  └── FALLIDO (puntaje < 70) → Marcado para revisión manual
  ↓
Verificador revisa solicitud en Cola de Revisión
  ├── Ve solo solicitudes dentro de su alcance geográfico
  ├── Revisa detalles de dirección y fotos
  ├── Verifica resultados de análisis
  └── Toma decisión de aprobación
  ↓
¿Decisión de aprobación?
  ├── APROBAR → approve_address_request() ejecutado
  ├── RECHAZAR → reject_address_request_with_feedback()
  └── MARCAR → flag_address_for_review() para correcciones
  ↓
Al APROBAR:
  ├── Dirección insertada en tabla addresses
  ├── verified = true
  ├── UAC generado via generate_unified_uac_unique()
  └── Auto-publicación según address_type:
      ├── No residencial (negocio, gobierno, punto de referencia) → public = true
      └── Residencial → public = false
  ↓
Dirección disponible en sistema
  ├── Direcciones públicas visibles en búsqueda
  ├── Disponible para servicios de emergencia
  ├── Disponible para vinculación CAR
  └── Accesible via API (si pública)
  ↓
Solicitante recibe notificación
  ↓
Fin
```

### Estados de Dirección en Sistema Actual
- **Pendiente**: Enviado y esperando verificación
- **Marcado**: Requiere revisión manual por problemas de validación
- **Aprobado**: Verificado y UAC generado
- **Rechazado**: Devuelto con razón de rechazo
- **Publicado**: public=true (buscable por todos)
- **Privado**: public=false (buscable solo por usuarios autorizados)

### Política de Auto-Publicación

```
Dirección Aprobada
  ↓
Verificar address_type
  ↓
¿Es no residencial?
  ├── business → public = true
  ├── commercial → public = true
  ├── government → public = true
  ├── landmark → public = true
  ├── institutional → public = true
  ├── industrial → public = true
  ├── public → public = true
  └── residential/otro → public = false
  ↓
Dirección guardada con visibilidad apropiada
```

## 3. Flujo de Registro de Dirección de Negocio

### Flujo Completo de Registro de Negocio

```
Inicio
  ↓
Usuario inicia registro de negocio
  ├── Via Solicitud Unificada → "Registrar Negocio"
  └── Via Mis Negocios → "Agregar Nuevo Negocio"
  ↓
Paso 1: Selección de Dirección
  ├── Buscar direcciones NAR existentes
  ├── Ingresar UAC directamente
  └── O solicitar nueva dirección (va a flujo NAR)
  ↓
¿Dirección encontrada/seleccionada?
  ├── SÍ → Proceder a detalles del negocio
  └── NO → Enviar solicitud NAR primero
  ↓
Paso 2: Información del Negocio
  ├── Nombre de organización (requerido)
  ├── Categoría de negocio (requerido)
  │   └── retail, restaurante, salud, educación,
  │       gobierno, financiero, hospitalidad, profesional,
  │       industrial, religioso, entretenimiento, transporte,
  │       servicios públicos, sin fines de lucro, otro
  ├── Tipo de dirección de negocio
  │   └── COMERCIAL, SEDE, SUCURSAL, ALMACÉN,
  │       INDUSTRIAL, GOBIERNO
  ├── Números de registro (opcional)
  │   ├── Número de registro comercial
  │   └── Número de identificación fiscal
  └── Continuar
  ↓
Paso 3: Información de Contacto
  ├── Nombre de contacto principal
  ├── Teléfono de contacto principal
  ├── Email de contacto principal
  ├── Teléfono secundario (opcional)
  └── URL del sitio web (opcional)
  ↓
Paso 4: Detalles del Negocio
  ├── Cantidad de empleados
  ├── Capacidad de clientes
  ├── ¿Estacionamiento disponible?
  │   └── Si sí: capacidad de estacionamiento
  ├── ¿Accesible para sillas de ruedas?
  ├── ¿Servicio público?
  ├── ¿Requiere cita?
  └── Servicios ofrecidos (selección múltiple)
  ↓
Paso 5: Horarios de Operación
  ├── Horario día por día
  │   └── Para cada día: hora apertura, hora cierre, o cerrado
  └── Idiomas hablados (selección múltiple)
  ↓
Paso 6: Configuración de Visibilidad
  ├── ¿Visible públicamente en directorio?
  ├── ¿Mostrar en mapas?
  └── ¿Mostrar información de contacto?
  ↓
Enviar registro de negocio
  ↓
Sistema crea address_request con:
  ├── address_type = 'business'
  ├── verification_analysis.organization = detalles del negocio
  └── status = 'pending'
  ↓
Verificador revisa solicitud de negocio
  ├── Valida completitud de información del negocio
  ├── Verifica campos requeridos (organization_name, business_category)
  └── Toma decisión de aprobación
  ↓
Al APROBAR: approve_business_address_request()
  ├── Crea registro de dirección (si es nuevo)
  ├── Crea registro en organization_addresses
  ├── Establece public = true (negocios siempre públicos)
  └── Negocio aparece en Directorio de Negocios
  ↓
Propietario del negocio recibe notificación
  ↓
Fin
```

## 4. Proceso CAR (Repositorio de Direcciones del Ciudadano)

### Flujo de Declaración/Verificación de Direcciones de Ciudadanos

```
Inicio
  ↓
Ciudadano accede al Portal Ciudadano
  ↓
Sistema verifica registro de persona existente
  ├── ¿Registro de persona existe?
  │   ├── NO → Crea nuevo registro de persona (trigger ensure_person_exists)
  │   └── SÍ → Carga direcciones existentes
  ↓
Ciudadano ve direcciones actuales
  ├── Dirección primaria mostrada
  ├── Direcciones secundarias listadas
  └── Historial de direcciones mostrado
  ↓
Ciudadano selecciona acción
  ├── Establecer Dirección Primaria → Abre SetPrimaryAddressForm
  ├── Agregar Dirección Secundaria → Abre AddSecondaryAddressForm
  └── Solicitar Verificación de Residencia → Abre ResidencyVerificationForm
  ↓
Completar Formulario de Dirección
  ├── Dirección Primaria: 
  │   ├── Entrada de UAC (buscar o ingresar)
  │   ├── Selección de alcance (EDIFICIO o UNIDAD)
  │   ├── UAC de unidad (si alcance UNIDAD)
  │   ├── Nivel de privacidad (PRIVADO, SOLO_REGIÓN, PÚBLICO)
  │   └── Fecha efectiva
  ├── Dirección Secundaria:
  │   ├── Entrada de UAC
  │   ├── Selección de alcance
  │   └── UAC de unidad (si aplica)
  └── Verificación de Residencia:
      ├── Tipo de verificación
      ├── Subida de documentos
      └── Notas de verificación
  ↓
Sistema procesa solicitud via funciones RPC
  ├── set_primary_address() → Actualiza/crea citizen_address
  ├── add_secondary_address() → Crea nuevo citizen_address
  └── Verificación de residencia → Crea residency_ownership_verifications
  ↓
Verificación de Auto-Aprobación (para declaraciones de direcciones)
  ├── trigger_auto_approve_citizen_address() se ejecuta
  ├── ¿UAC referencia dirección NAR verificada?
  │   ├── SÍ → Estado establecido a CONFIRMED
  │   │         log_auto_approval_event() registra evento AUTO_VERIFY
  │   │         Ciudadano notificado inmediatamente
  │   └── NO → Estado permanece SELF_DECLARED
  │            Requiere verificación manual
  ↓
Cola de Revisión Manual (para no auto-aprobados)
  ├── Verificadores CAR (verification_domain: 'car' o 'both') revisan
  ├── Verifican documentación y pruebas proporcionadas
  └── Actualizan estado via set_citizen_address_status()
  ↓
Actualización de Estado
  ├── CONFIRMED → Dirección se vuelve activa
  ├── REJECTED → Regresa al ciudadano con razón
  └── REQUIRES_DOCUMENTS → Ciudadano debe proporcionar prueba adicional
  ↓
Dirección se vuelve activa en perfil del ciudadano
  ├── Dirección primaria usada para correspondencia oficial
  ├── Configuración de privacidad aplicada
  └── Direcciones históricas preservadas con fechas efectivas
  ↓
Ciudadano recibe notificación de cambio de estado
  ↓
Fin
```

### Tipos de Direcciones CAR
- **Dirección Primaria (PRIMARY)**: Dirección residencial principal (una activa por persona)
- **Dirección Secundaria (SECONDARY)**: Direcciones adicionales (trabajo, vacaciones, etc.)
- **Direcciones Históricas**: Direcciones previas con fechas effective_to
- **Alcances de Dirección**: 
  - `BUILDING` - Propiedad/edificio completo
  - `UNIT` - Unidad específica dentro del edificio (requiere unit_uac)

### Niveles de Privacidad
- **PRIVATE**: Solo visible para propietario y oficiales autorizados
- **REGION_ONLY**: Visible para oficiales dentro de la misma región
- **PUBLIC**: Visible en búsquedas públicas (si searchable_by_public=true)

## 5. Proceso de Gestión de Emergencias

### Flujo de Reporte y Respuesta de Incidentes de Emergencia

```
Inicio - Emergencia Reportada
  ↓
Recepción de Reporte via EmergencyDispatchDialog
  ├── Selección de tipo de emergencia
  │   └── médica, fuego, robo, asalto, accidente, etc.
  ├── Nivel de prioridad (baja=1, media=2, alta=3, crítica=4)
  ├── Entrada de ubicación
  │   ├── Código UAC (si se conoce)
  │   ├── Búsqueda de dirección
  │   └── Coordenadas GPS
  ├── Descripción del incidente
  └── Información de contacto del reportante
  ↓
Sistema crea registro emergency_incident
  ├── Genera incident_number (INC-AAAA-XXXXXX)
  ├── Genera incident_uac via generate_incident_uac()
  ├── Encripta información sensible
  ├── Establece status = "reported"
  └── Almacena detalles del reportante (encriptados)
  ↓
Edge function notify-emergency-operators activada
  ├── Crea emergency_notifications para despachadores
  ├── Envía información de prioridad y tipo de emergencia
  └── Incluye número de incidente para seguimiento
  ↓
Despachador de Policía recibe alerta
  ├── Ve incidente en dashboard IncidentList
  ├── Ve ubicación y descripción desencriptada
  └── Revisa nivel de prioridad
  ↓
Despachador asigna incidente a unidad disponible
  ├── Ve unidades disponibles via UnitManagement
  ├── Selecciona unidad(es) óptima(s) basándose en:
  │   ├── Proximidad al incidente
  │   ├── Estado de disponibilidad de unidad
  │   └── Capacidades de unidad
  ├── Actualiza array assigned_units
  └── Trigger auto_update_incident_status() se activa automáticamente
  ↓
Estado actualizado automáticamente a "dispatched"
  ├── Timestamp dispatched_at registrado
  ├── Estado cambiado de "reported" a "dispatched"
  └── notify-unit-assignment envía notificación a unidad
  ↓
Unidad en camino a ubicación
  ├── Líder de unidad acepta asignación
  ├── Actualizaciones de estado en tiempo real via UnitStatusManager
  ├── Rastreo GPS de ubicación de unidad
  └── Navegación al incidente usando UAC
  ↓
Unidad llega a la escena
  ├── Estado actualizado a "on_scene"
  ├── Timestamp responded_at registrado
  └── Oficial comienza manejo del incidente
  ↓
Proceso de solicitud de respaldo (si es necesario)
  ├── Líder de unidad abre RequestBackupDialog
  ├── Especifica requisitos de respaldo
  ├── Edge function process-backup-request activada
  ├── Notificaciones de emergencia creadas para unidades cercanas
  ├── Estado actualizado a "backup_requested"
  └── BackupNotificationManager maneja coordinación
  ↓
Resolución del incidente
  ├── Oficial completa manejo del incidente
  ├── Estado actualizado a "resolved"
  ├── Timestamp resolved_at registrado
  ├── Notas de campo enviadas
  └── Documentación del incidente finalizada
  ↓
Cierre del incidente y reportes
  ├── Estado actualizado a "closed"
  ├── Timestamp closed_at registrado
  ├── Reporte final del incidente generado
  ├── Datos de analíticas actualizados
  └── notify-incident-reporter notifica al ciudadano (si aplica)
  ↓
Fin
```

### Estados de Incidente
- **reported**: Recién recibido por el sistema
- **dispatched**: Unidad asignada (auto-establecido por trigger cuando assigned_units poblado)
- **responding**: Unidad en camino a ubicación
- **on_scene**: Oficial presente en ubicación
- **backup_requested**: Unidades adicionales solicitadas
- **resolved**: Situación manejada exitosamente
- **closed**: Toda documentación completada

### SLAs de Tiempo de Respuesta
- **Crítico (prioridad=4)**: 3 minutos
- **Alto (prioridad=3)**: 8 minutos
- **Medio (prioridad=2)**: 15 minutos
- **Bajo (prioridad=1)**: 30 minutos

## 6. Integración de Sistemas

### Flujo de Verificación de Dirección de Emergencia

```
Reporte de Emergencia Recibido
  ↓
Sistema verifica dirección/UAC proporcionado
  ├── ¿UAC proporcionado?
  │   ├── SÍ → Búsqueda en tabla addresses del NAR
  │   └── NO → Intentar búsqueda de dirección
  ↓
¿UAC válido encontrado en NAR?
  ├── SÍ → Obtiene coordenadas precisas
  │         └── incident_uac establecido al UAC verificado
  └── NO → Proceso de verificación rápida
      ├── Busca direcciones similares
      ├── Usa coordenadas GPS proporcionadas
      └── Marca para mejora de dirección
  ↓
Coordenadas confirmadas
  ↓
Continúa con despacho de emergencia
  ↓
Post-Incidente: Retroalimentación de calidad de dirección
  ├── Si se encontraron problemas de ubicación
  │   └── Genera reporte de mejora para NAR
  └── Actualiza metadatos de dirección si es necesario
```

### Flujo de Inteligencia Compartida

```
Incidente Policial Completado
  ↓
¿Involucra problemas de dirección?
  ├── SÍ → Genera reporte para NAR
  │   ├── Dificultades de ubicación encontradas
  │   ├── Direcciones duplicadas encontradas
  │   ├── UACs incorrectos o faltantes
  │   └── Problemas de acceso/navegación
  └── NO → Solo archiva en sistema policial
  ↓
Equipo NAR revisa retroalimentación
  ├── Prioriza basándose en frecuencia de incidentes
  ├── Programa verificación de campo si es necesario
  └── Actualiza registros de direcciones
  ↓
Mejora de calidad de datos
```

## 7. Flujo de Retención de Elementos Rechazados

### Aplicación Automática de Política de Retención

```
Proceso de Limpieza Mensual (1ro del mes, 3 AM)
  ↓
Fase 1: Archivar (6+ meses de antigüedad)
  ↓
archive_old_rejected_requests()
  ├── Selecciona address_requests rechazados > 6 meses
  ├── Inserta en rejected_requests_archive
  │   └── Preserva: original_id, requester_id, todos los datos
  └── Elimina de address_requests
  ↓
archive_old_rejected_citizen_addresses()
  ├── Selecciona citizen_address REJECTED > 6 meses
  ├── Inserta en rejected_citizen_addresses_archive
  └── Elimina de citizen_address
  ↓
archive_old_rejected_verifications()
  ├── Selecciona residency_ownership_verifications rechazadas > 6 meses
  ├── Inserta en rejected_verifications_archive
  └── Elimina de tabla principal
  ↓
Fase 2: Anonimizar (24+ meses de antigüedad)
  ↓
anonymize_archived_records()
  ├── Actualiza registros archivados > 24 meses
  ├── Establece requester_id/person_id/user_id = NULL
  ├── Establece timestamp anonymized_at
  └── Preserva datos no-PII para estadísticas
  ↓
Registra resultados de limpieza
  ├── Cuenta de registros archivados
  ├── Cuenta de registros anonimizados
  └── Inserta en cleanup_audit_log
  ↓
Fin
```

### Eliminación Manual (Iniciada por Usuario)

```
Ciudadano ve solicitud rechazada
  ↓
Hace clic en "Eliminar" en elemento rechazado
  ↓
delete_rejected_request(request_id) ejecutado
  ├── Verifica que usuario es propietario de solicitud
  ├── Verifica status = 'rejected'
  └── Elimina de address_requests
  ↓
Confirmación mostrada al usuario
```

## 8. Procesos de Calidad y Mantenimiento

### Auditoría Automática de Calidad

```
Proceso Diario Automático
  ↓
Escanea direcciones nuevas/modificadas
  ↓
Aplica reglas de validación
  ├── Coordenadas dentro de límites geográficos
  ├── UACs únicos y válidos
  ├── Fotografías de calidad aceptable
  ├── Información completa y consistente
  └── Cálculo de puntaje de completitud
  ↓
¿Problemas detectados?
  ├── SÍ → flag_address_for_review()
  │   ├── Establece flagged = true
  │   ├── Registra flag_reason
  │   └── Agrega a cola de revisión manual
  └── NO → Confirma calidad
  ↓
Genera reporte de calidad diario
  ↓
Notifica a supervisores sobre problemas
```

### Auditoría de Auto-Aprobación CAR

```
Activado en INSERT/UPDATE de citizen_address
  ↓
trigger_auto_approve_citizen_address() se ejecuta
  ↓
Verificar condiciones:
  ├── ¿Estado = SELF_DECLARED?
  ├── ¿UAC proporcionado?
  └── ¿UAC existe en NAR verificado?
  ↓
¿Todas las condiciones cumplidas?
  ├── SÍ → Actualizar estado a CONFIRMED
  │         └── Activar log_auto_approval_event()
  └── NO → Sin acción (permanece SELF_DECLARED)
  ↓
Evento registrado en citizen_address_event
  ├── event_type = 'AUTO_VERIFY'
  ├── actor_id = NULL (sistema)
  └── payload = detalles de verificación
```

### Mantenimiento Preventivo

```
Proceso Semanal
  ↓
Analiza patrones de uso
  ├── Direcciones con alta actividad
  ├── Frecuencia de incidentes de emergencia
  └── Analíticas de búsqueda
  ↓
Identifica direcciones que necesitan re-verificación
  ├── Fechas de verificación antiguas
  ├── Problemas reportados por usuarios
  └── Degradación de calidad de fotos
  ↓
Programa verificaciones de campo
  ↓
Asigna a agentes de campo (dentro del alcance geográfico)
  ↓
Actualiza información según hallazgos
```

## Conclusión

Estos diagramas de flujo documentan los procesos interconectados del Sistema Nacional de Direcciones Biakam a diciembre de 2025. Las mejoras clave incluyen:

- Flujo **Unificado de Solicitud de Direcciones** consolidando flujos NAR, CAR y Negocios
- **Auto-publicación** basada en tipo de dirección (eliminando publicación manual)
- **Auto-aprobación** para declaraciones CAR vinculadas a direcciones NAR verificadas
- **Alcance de dominio de verificación** para permisos flexibles de verificadores
- **Alcance geográfico** asegurando que usuarios vean solo datos relevantes
- **Política de retención** con archivado y anonimización automáticos
- **Fallback de mapas** a OpenStreetMap cuando Google Maps no está disponible

El sistema mantiene la integridad y seguridad de datos mientras proporciona flujos de trabajo eficientes para todas las partes interesadas.

---

*Última Actualización: Diciembre 2025*
*Versión: 3.0*
