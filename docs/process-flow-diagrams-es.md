# Diagramas de Flujo de Procesos - Sistema ConnectNation Address

## 1. Proceso NAR (Registro Nacional de Direcciones)

### Flujo de Creación de Direcciones

```
Inicio
  ↓
Ciudadano envía solicitud de dirección via Portal Público
  ├── Completa formulario de solicitud con detalles de ubicación
  ├── Proporciona justificación para creación de dirección
  ├── Sube fotos de propiedad y documentos de propiedad
  └── Envía coordenadas (GPS o entrada manual)
  ↓
Sistema realiza verificaciones automáticas
  ├── Validación de coordenadas (dentro de límites del país)
  ├── Análisis de calidad de fotos
  ├── Detección de direcciones duplicadas
  └── Verificación de consistencia de información de dirección
  ↓
¿Resultado de auto-verificación?
  ├── APROBADO → Dirección marcada para revisión estándar
  └── FALLIDO → Dirección marcada para revisión manual
  ↓
Verificador revisa solicitud en Cola de Revisión
  ├── Ve detalles de dirección y fotos
  ├── Verifica resultados de análisis de verificación
  ├── Revisa recomendaciones de auto-verificación
  └── Toma decisión de aprobación
  ↓
¿Decisión de aprobación?
  ├── APROBAR → Dirección pasa a cola de publicación
  ├── RECHAZAR → Regresa al ciudadano con razón de rechazo
  └── EDITAR → Verificador modifica detalles antes de aprobar
  ↓
Registrador publica dirección aprobada
  ├── Genera UAC (Código de Dirección Universal)
  ├── Establece dirección como activa en sistema
  └── Hace dirección buscable
  ↓
Dirección queda disponible en el sistema
  ├── Visible en búsqueda pública de direcciones
  ├── Disponible para servicios de emergencia
  └── Accesible via aplicaciones móviles
  ↓
Ciudadano recibe notificación de aprobación
  ↓
Fin
```

### Estados de Dirección en Sistema Actual
- **Borrador**: Guardado localmente pero no enviado (modo offline)
- **Pendiente**: Enviado y esperando verificación
- **Marcado**: Requiere revisión manual debido a problemas de validación
- **Verificado**: Aprobado por verificador, esperando publicación
- **Publicado**: Activo en sistema con UAC generado
- **Rechazado**: Devuelto al ciudadano con correcciones requeridas

## 2. Proceso CAR (Repositorio de Direcciones del Ciudadano)

### Flujo de Declaración/Verificación de Direcciones por Ciudadanos

```
Inicio
  ↓
Ciudadano accede al Gestor de Verificación de Direcciones del Ciudadano
  ↓
Sistema verifica registro de persona existente
  ├── ¿Registro de persona existe?
  │   ├── NO → Crea nuevo registro de persona vinculado al usuario auth
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
  ├── Dirección Primaria: entrada UAC, selección de alcance, fecha efectiva
  ├── Dirección Secundaria: entrada UAC, selección de alcance
  └── Verificación de Residencia: subida de documentos, prueba de residencia
  ↓
Sistema procesa solicitud via funciones RPC
  ├── set_primary_address() → Actualiza tabla citizen_address
  ├── add_secondary_address() → Crea nuevo registro citizen_address
  └── Verificación de residencia → Crea registro residency_verification
  ↓
Cola de Revisión de Direcciones (para verificadores/registradores)
  ├── Verificadores revisan direcciones ciudadanas pendientes
  ├── Verifican documentación y pruebas proporcionadas
  └── Actualizan estado de dirección via set_citizen_address_status()
  ↓
Actualización de Estado
  ├── APROBADO → Dirección se vuelve activa
  ├── RECHAZADO → Regresa al ciudadano con razón
  └── REQUIERE_DOCUMENTOS → Ciudadano debe proporcionar prueba adicional
  ↓
Dirección se vuelve activa en perfil del ciudadano
  ├── Dirección primaria usada para correspondencia oficial
  ├── Direcciones secundarias vinculadas al registro de persona
  └── Direcciones históricas preservadas con fechas efectivas
  ↓
Ciudadano recibe notificación de cambio de estado
  ↓
Fin
```

### Tipos de Direcciones CAR en Sistema Actual
- **Dirección Primaria**: Dirección residencial principal (una por persona)
- **Dirección Secundaria**: Direcciones adicionales (trabajo, vacaciones, etc.)
- **Direcciones Históricas**: Direcciones previas con fechas de retiro
- **Alcances de Dirección**: DWELLING (propiedad completa) o UNIT (unidad específica)

## 3. Proceso de Gestión de Emergencias

### Flujo de Reporte y Manejo de Incidentes de Emergencia

```
Inicio - Emergencia Reportada
  ↓
Recepción de Reporte via EmergencyDispatchDialog
  ├── Selección de tipo de emergencia (médica, fuego, robo, asalto, etc.)
  ├── Nivel de prioridad (baja=1, media=2, alta=3, crítica=4)
  ├── Entrada de ubicación (dirección o coordenadas)
  ├── Descripción del incidente
  └── Información de contacto del reportante
  ↓
Sistema crea registro emergency_incident
  ├── Genera incident_number único (INC-timestamp)
  ├── Encripta información sensible usando edge function
  ├── Establece estado inicial como "reported"
  └── Almacena detalles de contacto del reportante
  ↓
Se activa edge function notify-emergency-operators
  ├── Notifica a operadores de policía disponibles
  ├── Envía información de prioridad y tipo de emergencia
  └── Incluye número de incidente para seguimiento
  ↓
Operador de Policía recibe alerta via IncidentList
  ├── Ve detalles del incidente en dashboard
  ├── Ve ubicación y descripción desencriptada
  └── Revisa nivel de prioridad y tipo de emergencia
  ↓
Dispatcher asigna incidente a unidad disponible
  ├── Actualiza campo assigned_units en base de datos
  ├── Establece timestamp dispatched_at
  └── Cambia estado a "assigned"
  ↓
Unidad recibe notificación via notify-unit-assignment
  ├── Miembros de unidad ven incidente en su dashboard
  ├── Líder de unidad puede aceptar o solicitar respaldo
  └── Estado de incidente se actualiza a "responding"
  ↓
Unidad en camino a ubicación
  ├── Actualizaciones de estado en tiempo real via UnitStatusManager
  ├── Rastreo GPS de ubicación de unidad
  └── Cálculos de tiempo estimado de llegada
  ↓
Unidad llega a la escena
  ├── Estado actualizado a "on_scene"
  ├── Timestamp responded_at registrado
  └── Oficial comienza manejo del incidente
  ↓
Proceso de solicitud de respaldo (si es necesario)
  ├── RequestBackupDialog abierto por líder de unidad
  ├── Solicitud de respaldo enviada via process-backup-request
  ├── Notificaciones de emergencia creadas para otras unidades
  └── BackupNotificationManager maneja coordinación de respaldo
  ↓
Resolución del incidente
  ├── Oficial completa reporte del incidente
  ├── Estado actualizado a "resolved"
  ├── Timestamp resolved_at registrado
  └── Documentación del incidente finalizada
  ↓
Cierre del incidente y reportes
  ├── Reporte final del incidente generado
  ├── Datos de analíticas actualizados para seguimiento de rendimiento
  └── Reportante notificado de resolución (si aplica)
  ↓
Fin
```

### Estados de Incidente en Sistema Actual
- **reported**: Recién recibido por el sistema
- **assigned**: Unidad asignada para respuesta
- **responding**: Unidad en camino a ubicación
- **on_scene**: Oficial presente en ubicación
- **backup_requested**: Unidades adicionales solicitadas
- **resolved**: Situación manejada exitosamente
- **closed**: Toda documentación completada

### Componentes del Sistema de Emergencias
- **EmergencyDispatchDialog**: Interfaz de envío de reporte inicial
- **IncidentList**: Dashboard para ver y gestionar incidentes
- **UnitManagement**: Asignación de unidades y seguimiento de estado
- **BackupNotificationManager**: Comunicación inter-unidad para solicitudes de respaldo
- **Emergency Edge Functions**: Procesamiento seguro y notificaciones

## 4. Integración entre Sistemas

### Flujo de Verificación de Dirección de Emergencia

```
Reporte de Emergencia
  ↓
Sistema verifica UAC proporcionado
  ├── ¿UAC válido en NAR?
  │   ├── SÍ → Obtiene coordenadas precisas
  │   └── NO → Activa proceso de verificación rápida
  ↓
Proceso de Verificación Rápida
  ├── Busca direcciones similares
  ├── Verifica con reportes CAR recientes
  └── Contacta al reportante para clarificación
  ↓
Coordenadas confirmadas
  ↓
Continúa con despacho de emergencia
```

### Flujo de Inteligencia Compartida

```
Incidente Policial Completado
  ↓
¿Involucra problemas de dirección?
  ├── SÍ → Genera reporte para NAR
  └── NO → Solo archiva en sistema policial
  ↓
Reporte NAR incluye:
  ├── Dificultades de localización
  ├── Direcciones duplicadas encontradas
  ├── UACs incorrectos o faltantes
  └── Recomendaciones de mejora
  ↓
NAR revisa e implementa mejoras
  ↓
Actualización de calidad de datos
```

## 5. Procesos de Calidad y Mantenimiento

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
  └── Información completa y consistente
  ↓
¿Problemas detectados?
  ├── SÍ → Marca para revisión manual
  └── NO → Confirma calidad
  ↓
Genera reporte de calidad diario
  ↓
Notifica a supervisores sobre problemas
```

### Mantenimiento Preventivo

```
Proceso Semanal
  ↓
Analiza patrones de uso
  ↓
Identifica direcciones con alta actividad
  ↓
Programa verificaciones de campo
  ↓
Asigna a agentes para re-verificación
  ↓
Actualiza información según hallazgos
```

## Conclusión

Estos diagramas de flujo muestran los procesos interconectados del sistema de direcciones digitales, desde la creación inicial de direcciones hasta su uso en situaciones de emergencia, garantizando la integridad y utilidad del sistema para todas las partes interesadas.