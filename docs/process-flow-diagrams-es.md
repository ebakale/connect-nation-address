# Diagramas de Flujo de Procesos - Sistema de Direcciones Digitales

## 1. Proceso NAR (Registro Nacional de Direcciones)

### Flujo de Creación de Direcciones

```
Inicio
  ↓
Agente de Campo llega a ubicación
  ↓
Verifica coordenadas GPS
  ↓
Toma fotografías del edificio/estructura
  ↓
Completa formulario de captura de dirección
  ├── Información básica (nombre, tipo)
  ├── Coordenadas geográficas
  ├── Fotografías
  └── Datos del propietario/ocupante
  ↓
Genera UAC (Código de Dirección Universal)
  ↓
Envía solicitud para revisión
  ↓
Verificador revisa la información
  ├── ¿Información completa y precisa?
  │   ├── SÍ → Aprueba dirección
  │   └── NO → Rechaza con comentarios
  ↓
Registrador publica la dirección
  ↓
Dirección activa en el sistema
  ↓
Notificación enviada al ciudadano
  ↓
Fin
```

### Estados de la Dirección
- **Borrador**: Capturada pero no enviada
- **Pendiente**: En espera de verificación
- **Verificada**: Aprobada por verificador
- **Publicada**: Activa en el sistema
- **Rechazada**: Requiere correcciones

## 2. Proceso CAR (Registro de Direcciones del Ciudadano)

### Flujo de Declaración/Verificación por Ciudadanos

```
Inicio
  ↓
Ciudadano accede al Portal Público
  ↓
Busca su dirección existente
  ├── ¿Dirección encontrada?
  │   ├── SÍ → Solicita verificación de residencia
  │   └── NO → Solicita nueva dirección
  ↓
Completa formulario de solicitud
  ├── Información personal
  ├── Documentos de identificación
  ├── Comprobante de residencia
  └── Fotografías adicionales
  ↓
Envía solicitud
  ↓
Sistema valida documentación
  ├── ¿Documentos válidos?
  │   ├── SÍ → Continúa proceso
  │   └── NO → Solicita correcciones
  ↓
Verificador revisa solicitud
  ├── ¿Requiere visita de campo?
  │   ├── SÍ → Asigna a agente de campo
  │   └── NO → Aprueba directamente
  ↓
Agente de campo verifica (si aplica)
  ↓
Actualización de dirección
  ↓
Notificación al ciudadano
  ↓
Fin
```

### Tipos de Solicitudes CAR
- **Verificación de Residencia**: Confirmar ocupación actual
- **Cambio de Propietario**: Transferencia de propiedad
- **Corrección de Datos**: Actualizar información incorrecta
- **Dirección Secundaria**: Registrar dirección adicional

## 3. Proceso de Gestión de Emergencias

### Flujo de Reporte y Manejo de Emergencias

```
Inicio - Emergencia Reportada
  ↓
Recepción del Reporte
  ├── Portal Web
  ├── Aplicación Móvil
  ├── Llamada Telefónica
  └── Sistema Automático
  ↓
Operador de Policía recibe alerta
  ↓
Clasifica el Incidente
  ├── Prioridad (Alta/Media/Baja)
  ├── Tipo (Seguridad/Médica/Fuego/Otro)
  └── Ubicación (UAC o coordenadas)
  ↓
¿Dirección UAC válida?
  ├── SÍ → Continúa con despacho
  └── NO → Verificación de dirección rápida
  ↓
Dispatcher asigna unidad disponible
  ├── Verifica disponibilidad de unidades
  ├── Calcula tiempo de respuesta
  └── Asigna unidad más cercana
  ↓
Unidad recibe notificación
  ↓
Oficial confirma recepción
  ↓
Estado: "Respondiendo"
  ↓
Oficial llega al lugar
  ↓
Estado: "En Escena"
  ↓
¿Requiere respaldo?
  ├── SÍ → Solicita unidades adicionales
  └── NO → Continúa con intervención
  ↓
Oficial maneja la situación
  ↓
Completa reporte del incidente
  ↓
Estado: "Resuelto"
  ↓
Cierre del incidente
  ↓
Fin
```

### Estados del Incidente
- **Reportado**: Recién recibido por el sistema
- **Asignado**: Unidad asignada para respuesta
- **Respondiendo**: Unidad en camino al lugar
- **En Escena**: Oficial presente en el lugar
- **Requiere Respaldo**: Solicitud de unidades adicionales
- **Resuelto**: Situación manejada exitosamente
- **Cerrado**: Documentación completada

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