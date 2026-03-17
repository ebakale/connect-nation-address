# 🇬🇶 ConEG — Plataforma Nacional de Servicios Digitales

## Presentación al Gobierno de Guinea Ecuatorial

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Documento Institucional  
**Audiencia:** Autoridades gubernamentales, Ministerios, Fuerzas de Seguridad del Estado  

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [El Problema Nacional](#2-el-problema-nacional)
3. [La Solución: ConEG](#3-la-solución-coneg)
4. [Módulo 1 — Sistema Nacional de Direcciones (NAR/CAR)](#4-módulo-1--sistema-nacional-de-direcciones-narcar)
5. [Módulo 2 — Gestión de Emergencias](#5-módulo-2--gestión-de-emergencias)
6. [Módulo 3 — Servicio Postal y Logística](#6-módulo-3--servicio-postal-y-logística)
7. [El Código UAC — Identidad Geográfica Digital](#7-el-código-uac--identidad-geográfica-digital)
8. [Impacto Nacional](#8-impacto-nacional)
9. [Seguridad Nacional](#9-seguridad-nacional)
10. [Cobertura Geográfica](#10-cobertura-geográfica)
11. [Arquitectura Tecnológica](#11-arquitectura-tecnológica)
12. [Modelo de Implementación](#12-modelo-de-implementación)
13. [Retorno de Inversión (ROI)](#13-retorno-de-inversión-roi)
14. [Casos de Uso Reales](#14-casos-de-uso-reales)
15. [Comparativa Internacional](#15-comparativa-internacional)
16. [Hoja de Ruta](#16-hoja-de-ruta)
17. [Llamada a la Acción](#17-llamada-a-la-acción)

---

## 1. Resumen Ejecutivo

**ConEG** (Connect Equatorial Guinea) es la primera plataforma digital integrada diseñada específicamente para resolver la ausencia de un sistema postal tradicional en Guinea Ecuatorial.

La plataforma unifica tres servicios críticos en una sola infraestructura:

| Módulo | Función Principal |
|--------|-------------------|
| 📍 **Sistema Nacional de Direcciones** | Registro, codificación y verificación de direcciones |
| 🚨 **Gestión de Emergencias** | Despacho, coordinación y respuesta a incidentes |
| 📦 **Servicio Postal y Logística** | Entrega de paquetes, rastreo y gestión de pedidos |

> **Visión:** Que cada ciudadano, edificio y negocio en Guinea Ecuatorial posea una dirección digital única, verificable e interconectada con los servicios del Estado.

---

## 2. El Problema Nacional

### Situación Actual

Guinea Ecuatorial **no cuenta con un sistema postal estandarizado**. Esta ausencia genera consecuencias directas:

- ❌ **Servicios de emergencia ineficientes** — Ambulancias y bomberos no pueden localizar direcciones exactas
- ❌ **Exclusión financiera** — Los ciudadanos no pueden recibir correspondencia bancaria ni verificar domicilio
- ❌ **Comercio limitado** — El comercio electrónico y la logística son prácticamente inexistentes
- ❌ **Planificación urbana deficiente** — Sin datos georreferenciados, el desarrollo urbano carece de base
- ❌ **Seguridad comprometida** — Las fuerzas de seguridad no disponen de un sistema de localización rápida
- ❌ **Servicios gubernamentales fragmentados** — Cada ministerio gestiona ubicaciones de forma independiente

### Costo de la Inacción

| Área | Impacto Estimado |
|------|-----------------|
| Retrasos en emergencias | +15-30 min por incidente |
| Pérdida en comercio electrónico | Mercado sin explotar de millones USD/año |
| Inclusión financiera | Miles de ciudadanos sin acceso a servicios bancarios formales |
| Recaudación fiscal | Negocios informales sin registro de ubicación |

---

## 3. La Solución: ConEG

ConEG transforma la infraestructura digital de Guinea Ecuatorial mediante:

### Tres Pilares Integrados

```
┌─────────────────────────────────────────────────────┐
│                  ConEG PLATFORM                      │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ 📍 NAR   │  │ 🚨 EMERGENCIA│  │ 📦 POSTAL     │  │
│  │          │  │              │  │               │  │
│  │ Registro │  │  Despacho    │  │  Entrega      │  │
│  │ Nacional │  │  y Respuesta │  │  y Rastreo    │  │
│  │ Direccion│  │  Incidentes  │  │  Paquetes     │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                      │
│              🔗 Código UAC Unificado                 │
│              🌐 Multilingüe (ES/FR/Fang)             │
│              🔒 Seguridad de Grado Gubernamental     │
└─────────────────────────────────────────────────────┘
```

### Características Diferenciadoras

- **100% adaptado a Guinea Ecuatorial** — Regiones, ciudades y códigos del país
- **Funciona sin infraestructura postal previa** — Crea el sistema desde cero
- **Trilingüe** — Español, Francés e interfaz adaptable al Fang
- **Opera en zonas remotas** — Diseñado para funcionar con conectividad limitada
- **Soberanía de datos** — Toda la información se almacena bajo control nacional

---

## 4. Módulo 1 — Sistema Nacional de Direcciones (NAR/CAR)

### ¿Qué es?

El **Registro Nacional de Direcciones (NAR)** es el catastro digital de direcciones del país. Cada dirección recibe un **Código Único de Dirección (UAC)** que la identifica de forma permanente.

### Funcionalidades Principales

| Funcionalidad | Descripción |
|---------------|-------------|
| **Registro de Direcciones** | Ciudadanos y autoridades pueden registrar direcciones con coordenadas GPS |
| **Generación Automática de UAC** | Códigos únicos generados según estándar ISO |
| **Verificación Oficial** | Proceso de verificación por autoridades municipales |
| **Portal de Acceso Público** | Búsqueda pública de direcciones verificadas |
| **Gestión de Solicitudes** | Flujo completo de solicitud → revisión → aprobación |
| **Registro de Ciudadanos (CAR)** | Vinculación de personas a direcciones con privacidad controlada |

### Roles del Sistema

- **Ciudadano** — Solicita y gestiona sus direcciones
- **Municipalidad** — Verifica y aprueba solicitudes
- **Administrador Nacional** — Supervisión general del sistema
- **Verificador Autorizado** — Inspección de campo

### Ejemplo de Flujo

```
Ciudadano solicita dirección
    → Municipalidad revisa documentación
        → Verificador inspecciona en campo
            → Dirección aprobada + UAC generado
                → Ciudadano recibe su código único
```

---

## 5. Módulo 2 — Gestión de Emergencias

### ¿Qué es?

Un sistema completo de **despacho y coordinación de emergencias** que utiliza las direcciones UAC para localización instantánea.

### Funcionalidades Principales

| Funcionalidad | Descripción |
|---------------|-------------|
| **Centro de Despacho 112** | Interfaz para operadores de emergencia |
| **Localización por UAC** | Ubicación instantánea al recibir un código UAC |
| **Gestión de Unidades** | Seguimiento en tiempo real de patrullas, ambulancias y bomberos |
| **Priorización de Incidentes** | Sistema de 5 niveles de prioridad |
| **Solicitud de Refuerzos** | Protocolo estructurado de solicitud de apoyo |
| **Protocolo Agente Caído** | Respuesta automática de máxima prioridad |
| **Panel Supervisor** | Visión general de todas las operaciones en curso |

### Tipos de Emergencia Cubiertos

- 🚔 Policial — Robos, asaltos, disturbios
- 🚑 Médica — Accidentes, emergencias médicas
- 🚒 Incendios — Incendios estructurales y forestales
- 🌊 Desastres Naturales — Inundaciones, terremotos
- ⚠️ Seguridad Pública — Amenazas diversas

### Impacto Esperado

| Métrica | Sin ConEG | Con ConEG |
|---------|-----------|-----------|
| Tiempo de localización | 15-45 min | < 2 min |
| Tiempo de despacho | Manual, variable | Automatizado, < 1 min |
| Coordinación entre unidades | Por radio, desorganizada | Digital, en tiempo real |
| Registro de incidentes | En papel | Digital, completo, auditable |

---

## 6. Módulo 3 — Servicio Postal y Logística

### ¿Qué es?

El primer **sistema de entrega postal digital** de Guinea Ecuatorial, que permite enviar y recibir paquetes usando códigos UAC.

### Funcionalidades Principales

| Funcionalidad | Descripción |
|---------------|-------------|
| **Creación de Pedidos** | Registro digital de envíos con UAC de origen y destino |
| **Asignación de Agentes** | Distribución optimizada de rutas de entrega |
| **Rastreo en Tiempo Real** | Seguimiento del estado del paquete por el remitente y destinatario |
| **Prueba de Entrega** | Firma digital, foto y geolocalización |
| **Cobro Contra Entrega (COD)** | Gestión de pagos en efectivo al momento de entrega |
| **Preferencias de Entrega** | Ventanas horarias, instrucciones especiales, entrega segura |
| **Importación Masiva** | Carga de pedidos en lote para empresas |

### Cadena de Entrega

```
Remitente crea pedido (UAC origen → UAC destino)
    → Sistema genera número de seguimiento
        → Agente asignado recibe ruta optimizada
            → Agente recoge paquete
                → Agente entrega + captura prueba
                    → Destinatario confirma recepción
```

---

## 7. El Código UAC — Identidad Geográfica Digital

### Formato

```
[PAÍS]-[REGIÓN]-[CIUDAD]-[SECUENCIA]-[VERIFICACIÓN]
```

### Ejemplo

```
GQ-BN-MAL-001A00-7K
```

| Componente | Valor | Significado |
|------------|-------|-------------|
| GQ | País | Guinea Ecuatorial (ISO 3166-1) |
| BN | Región | Bioko Norte |
| MAL | Ciudad | Malabo |
| 001A00 | Secuencia | Identificador único del edificio |
| 7K | Verificación | Dígito de control anti-errores |

### Regiones Codificadas

| Código | Región |
|--------|--------|
| AN | Annobón |
| BN | Bioko Norte |
| BS | Bioko Sur |
| CS | Centro Sur |
| DJ | Djibloho |
| KN | Kié-Ntem |
| LI | Litoral |
| WN | Wele-Nzas |

### Ciudades Principales

| Región | Ciudades (código) |
|--------|-------------------|
| Bioko Norte | Malabo (MAL), Rebola (REB), Baney (BAN) |
| Bioko Sur | Luba (LUB), Riaba (RIA), Moca (MOC) |
| Litoral | Bata (BAT), Mbini (MBI), Kogo (KOG), Acalayong (ACA) |
| Centro Sur | Evinayong (EVI), Acurenam (ACU), Niefang (NIE) |
| Djibloho | Ciudad de la Paz (CDP) |
| Kié-Ntem | Ebebiyín (EBE), Mikomeseng (MIK) |
| Wele-Nzas | Mongomo (MON), Añisoc (ANI), Aconibe (ACO) |
| Annobón | San Antonio de Palé (SAP) |

### Propiedades del UAC

- ✅ **Único** — No existen dos direcciones con el mismo código
- ✅ **Verificable** — El dígito de control detecta errores de transcripción
- ✅ **Decodificable** — Se puede extraer región y ciudad del código
- ✅ **Escalable** — Soporta millones de direcciones por ciudad
- ✅ **Estándar** — Compatible con normas ISO internacionales

---

## 8. Impacto Nacional

### Impacto Económico

| Área | Beneficio |
|------|-----------|
| **Comercio Electrónico** | Habilita entregas confiables → abre mercado de e-commerce |
| **Inclusión Financiera** | Verificación de domicilio para cuentas bancarias y créditos |
| **Inversión Extranjera** | Infraestructura postal atrae empresas internacionales |
| **Recaudación Fiscal** | Registro de negocios con ubicación verificable |
| **Empleo** | Creación de empleos en logística, verificación y soporte |

### Impacto Social

| Área | Beneficio |
|------|-----------|
| **Identidad Ciudadana** | Cada hogar tiene una dirección oficial reconocida |
| **Acceso a Servicios** | Facilita acceso a servicios públicos y privados |
| **Emergencias** | Respuesta más rápida salva vidas |
| **Educación** | Localización precisa de escuelas y estudiantes |
| **Salud** | Campañas de vacunación y seguimiento epidemiológico eficientes |

### Impacto Gubernamental

| Área | Beneficio |
|------|-----------|
| **Censo y Estadísticas** | Base de datos georreferenciada para planificación |
| **Planificación Urbana** | Datos reales para desarrollo de infraestructura |
| **Coordinación Ministerial** | Sistema unificado compartido entre instituciones |
| **Modernización** | Posiciona a Guinea Ecuatorial como líder digital en la región |
| **Transparencia** | Auditoría completa de todas las operaciones |

---

## 9. Seguridad Nacional

### Capacidades de Seguridad

ConEG proporciona herramientas críticas para la seguridad del Estado:

#### 🛡️ Control Fronterizo
- Registro de direcciones en zonas fronterizas
- Monitoreo de actividad en áreas sensibles
- Cruce de datos con registros de inmigración

#### 🚔 Apoyo a Fuerzas de Seguridad
- Localización instantánea de direcciones durante operaciones
- Historial de incidentes por ubicación
- Coordinación multi-agencia en tiempo real

#### 🔐 Soberanía de Datos
- Toda la información almacenada bajo jurisdicción nacional
- Cifrado de datos sensibles (coordenadas, información personal)
- Control de acceso basado en roles con auditoría completa
- Cumplimiento con estándares internacionales de protección de datos

#### 📊 Inteligencia y Análisis
- Mapas de calor de incidentes por región
- Análisis de patrones delictivos por zona
- Informes automatizados para toma de decisiones

### Niveles de Acceso

| Nivel | Usuarios | Acceso |
|-------|----------|--------|
| **Ciudadano** | Público general | Solo direcciones propias y públicas |
| **Municipal** | Funcionarios locales | Direcciones de su jurisdicción |
| **Nacional** | Ministerios | Visión completa con restricciones |
| **Seguridad** | Fuerzas del Estado | Acceso completo con auditoría |
| **Administrador** | Equipo técnico | Gestión del sistema |

---

## 10. Cobertura Geográfica

### Fase 1 — Ciudades Principales (Año 1)

| Ciudad | Región | Prioridad |
|--------|--------|-----------|
| **Malabo** | Bioko Norte | 🔴 Máxima |
| **Bata** | Litoral | 🔴 Máxima |
| **Ciudad de la Paz** | Djibloho | 🟠 Alta |

### Fase 2 — Capitales Provinciales (Año 2)

| Ciudad | Región |
|--------|--------|
| Ebebiyín | Kié-Ntem |
| Mongomo | Wele-Nzas |
| Evinayong | Centro Sur |
| Luba | Bioko Sur |
| San Antonio de Palé | Annobón |

### Fase 3 — Cobertura Nacional Completa (Año 3)

- Todas las ciudades y pueblos principales
- Zonas rurales con acceso a servicios
- Integración con catastro nacional existente

---

## 11. Arquitectura Tecnológica

### Infraestructura

```
┌─────────────────────────────────┐
│     Interfaz Web / Móvil        │
│   (React, TypeScript, PWA)      │
├─────────────────────────────────┤
│     Capa de Seguridad           │
│   (Auth, RLS, Cifrado E2E)      │
├─────────────────────────────────┤
│     52+ Funciones Edge           │
│   (API, Procesamiento, Webhooks)│
├─────────────────────────────────┤
│     Base de Datos PostgreSQL     │
│   (RLS, Auditoría, Backup)      │
├─────────────────────────────────┤
│     Infraestructura Cloud        │
│   (Alta disponibilidad, CDN)    │
└─────────────────────────────────┘
```

### Características Técnicas

- **52+ Edge Functions** — Microservicios para cada operación crítica
- **Row Level Security (RLS)** — Seguridad a nivel de registro en base de datos
- **Cifrado E2E** — Datos sensibles cifrados punto a punto
- **Auditoría completa** — Registro inmutable de todas las acciones
- **API REST** — Integración con sistemas externos
- **Autenticación multifactor** — Seguridad de acceso reforzada
- **Respaldos automáticos** — Protección contra pérdida de datos
- **Internacionalización** — Soporte nativo ES/FR/EN

---

## 12. Modelo de Implementación

### Fases de Despliegue

```
FASE 1 (Meses 1-6)          FASE 2 (Meses 7-12)        FASE 3 (Meses 13-18)
─────────────────           ──────────────────          ──────────────────
• Despliegue en Malabo      • Expansión a Bata         • Cobertura nacional
• Formación de personal     • Integración policial     • API pública
• Registro piloto           • Sistema postal activo     • Servicios a terceros
• Sistema de emergencias    • Portal ciudadano         • Dashboard ejecutivo
```

### Equipo de Implementación

| Rol | Responsabilidad |
|-----|-----------------|
| Director del Proyecto | Coordinación general con el Gobierno |
| Equipo Técnico | Despliegue, configuración y mantenimiento |
| Formadores | Capacitación de usuarios gubernamentales |
| Verificadores de Campo | Validación de direcciones in situ |
| Soporte | Asistencia técnica continua 24/7 |

### Requisitos del Gobierno

- Designación de una contraparte ministerial
- Acceso a bases de datos existentes (catastro, censo)
- Infraestructura de red en oficinas gubernamentales
- Marco legal para adopción del sistema UAC

---

## 13. Retorno de Inversión (ROI)

### Beneficios Cuantificables

| Indicador | Valor Estimado |
|-----------|---------------|
| Reducción tiempo de respuesta emergencias | 70-80% |
| Nuevas direcciones registradas (Año 1) | 50,000+ |
| Empleos directos creados | 200+ |
| Ahorro en gestión documental | Significativo |
| Nuevos negocios formalizados | Miles |

### Beneficios No Cuantificables

- Prestigio internacional como país innovador
- Mejora en la percepción ciudadana del gobierno
- Base para futuras iniciativas de gobierno digital
- Atracción de inversión tecnológica extranjera
- Reducción de la economía informal

---

## 14. Casos de Uso Reales

### Caso 1: Emergencia Médica en Malabo

> Un ciudadano llama al 112 desde su hogar en el Barrio de Ela Nguema. Proporciona su código UAC **GQ-BN-MAL-034B12-5R**. El operador localiza la dirección exacta en menos de 5 segundos. La ambulancia más cercana recibe las coordenadas GPS directamente en su dispositivo. Tiempo de llegada: 8 minutos (vs. 35 minutos sin el sistema).

### Caso 2: Empresa de E-Commerce en Bata

> Una tienda online de Bata utiliza ConEG para entregar productos. El cliente proporciona su UAC al hacer el pedido. El repartidor recibe la ruta optimizada con navegación GPS hasta la puerta. Prueba de entrega con foto y firma digital. El comercio electrónico local se vuelve viable por primera vez.

### Caso 3: Verificación Bancaria

> Un ciudadano solicita un préstamo bancario. El banco verifica su dirección instantáneamente a través de la API de ConEG. El proceso que antes requería días de verificación manual ahora toma segundos. Más ciudadanos acceden a servicios financieros formales.

### Caso 4: Planificación de la Nueva Capital — Ciudad de la Paz

> El gobierno planifica la nueva capital en Djibloho. ConEG pre-registra todas las direcciones de los nuevos edificios durante la construcción. Cuando los residentes se trasladen, ya tendrán sus códigos UAC asignados. La ciudad nace digitalmente conectada desde el primer día.

---

## 15. Comparativa Internacional

### Países sin Sistema Postal vs. Con ConEG

| Característica | Sin Sistema | Con ConEG |
|---------------|-------------|-----------|
| Identificación de direcciones | Descripciones verbales | Código UAC único |
| Tiempo de localización | Variable (minutos-horas) | Segundos |
| Entrega de paquetes | Informal, poco fiable | Digital, rastreable |
| Emergencias | Desorganizadas | Coordinadas en tiempo real |
| Datos geográficos | Inexistentes | Completos y actualizados |
| Comercio electrónico | Prácticamente inexistente | Habilitado |

### Referentes Internacionales

| Sistema | País | Similitud |
|---------|------|-----------|
| What3Words | Global | Codificación de ubicaciones |
| Plus Codes (Google) | Global | Códigos de dirección |
| eSNAP | Rwanda | Direcciones nacionales en África |
| GhanaPostGPS | Ghana | Sistema postal digital africano |

> **ConEG supera a estos sistemas** al integrar direcciones + emergencias + postal en una sola plataforma, con soporte multilingüe y adaptación específica para Guinea Ecuatorial.

---

## 16. Hoja de Ruta

### 2026

| Trimestre | Hito |
|-----------|------|
| **Q1** | ✅ Plataforma desarrollada y funcional |
| **Q2** | Piloto en Malabo — 5,000 direcciones |
| **Q3** | Expansión a Bata — Sistema de emergencias operativo |
| **Q4** | 20,000 direcciones — Servicio postal activo |

### 2027

| Trimestre | Hito |
|-----------|------|
| **Q1** | Cobertura en 5 capitales provinciales |
| **Q2** | Integración con sistema policial nacional |
| **Q3** | API pública para sector privado |
| **Q4** | 100,000 direcciones registradas |

### 2028

| Trimestre | Hito |
|-----------|------|
| **Q1-Q2** | Cobertura nacional completa |
| **Q3-Q4** | Exportación del modelo a países vecinos |

---

## 17. Llamada a la Acción

### ¿Por qué ahora?

1. **La plataforma está lista** — ConEG ya es funcional con 52+ servicios activos
2. **El momento es oportuno** — La nueva capital (Ciudad de la Paz) necesita un sistema de direcciones desde su creación
3. **La ventana de oportunidad** — Guinea Ecuatorial puede ser el primer país de África Central con un sistema postal digital completo
4. **El costo de esperar** — Cada año sin sistema postal es un año de oportunidades económicas perdidas

### Próximos Pasos Propuestos

| Paso | Acción | Plazo |
|------|--------|-------|
| 1 | Reunión técnica de presentación detallada | 2 semanas |
| 2 | Firma de acuerdo marco de cooperación | 1 mes |
| 3 | Designación de equipo de contraparte | 1 mes |
| 4 | Inicio del piloto en Malabo | 3 meses |
| 5 | Evaluación del piloto y plan de expansión | 6 meses |

### Contacto

**ConEG — Plataforma Nacional de Servicios Digitales**  
Conectando Guinea Ecuatorial con el futuro digital

---

> *"Un país sin direcciones es un país invisible. ConEG hace visible a Guinea Ecuatorial."*

---

**© 2026 ConEG — Todos los derechos reservados**  
**Documento confidencial para uso gubernamental**
