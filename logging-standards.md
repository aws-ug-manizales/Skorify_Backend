# Logging Standards — Backend

**Version:** 1.0.0
**Status:** Draft — Pending Review
**Owner:** DevOps / SRE Team
**Last Updated:** 2026-05-14

---

## Table of Contents

1. [Objetivo del Logging](#1-objetivo-del-logging)
2. [Formato Obligatorio de Logs](#2-formato-obligatorio-de-logs)
3. [Niveles de Logging](#3-niveles-de-logging)
4. [Convenciones Obligatorias](#4-convenciones-obligatorias)
5. [Reglas de Seguridad](#5-reglas-de-seguridad)
6. [Buenas Prácticas](#6-buenas-prácticas)
7. [Ejemplos por Contexto](#7-ejemplos-por-contexto)
8. [Checklist de Implementación](#8-checklist-de-implementación)

---

## 1. Objetivo del Logging

El logging es una práctica fundamental en cualquier sistema backend de producción. No se trata de "agregar prints para debuggear" — es una disciplina de ingeniería que habilita observabilidad real sobre el comportamiento de los servicios.

### ¿Por qué implementamos logging?

**Observabilidad**
Los logs son uno de los tres pilares de observabilidad (junto con métricas y trazas). Permiten entender *qué está pasando* dentro de un servicio sin necesidad de conectarse directamente al servidor. Un log bien estructurado responde preguntas como: ¿qué solicitud llegó?, ¿qué procesó el sistema?, ¿cuánto tardó?, ¿qué falló?

**Debugging**
Cuando ocurre un bug en producción, el equipo de desarrollo necesita reconstruir el flujo de ejecución que llevó al error. Los logs estructurados con contexto suficiente (trace ID, request ID, usuario, endpoint) permiten hacer esa reconstrucción sin necesidad de reproducir el bug localmente.

**Incident Response**
Durante un incidente, los minutos cuentan. Logs claros, con niveles correctamente asignados y campos estandarizados, permiten al equipo de SRE identificar rápidamente:
- Si el problema es nuevo o recurrente
- Qué servicios están afectados
- Cuál es la secuencia de eventos que llevó al fallo
- Si hay una correlación entre errores y un despliegue, un pico de tráfico, o un tercero

**Relación con Monitoreo y SRE**
Los logs alimentan directamente las herramientas de monitoreo (Datadog, Grafana Loki, CloudWatch, etc.). Un log estructurado en JSON puede ser indexado, filtrado, y convertido en alertas automáticamente. Un log en texto plano o mal formateado es prácticamente inútil para automatización.

> **Regla de oro:** Si un log no puede ser leído por una máquina de forma confiable, no sirve para SRE.

---

## 2. Formato Obligatorio de Logs

### Requerimiento principal: JSON estructurado

**Todos los logs deben emitirse en formato JSON.** No se permite:
- Logs en texto plano (`console.log("Error en login")`)
- Concatenación manual de strings (`"Error: " + error.message + " user: " + userId`)
- Formato propietario de librerías sin configuración estructurada

### Estructura base

```json
{
  "timestamp": "2026-05-14T18:22:10.543Z",
  "level": "ERROR",
  "service": "auth-service",
  "environment": "production",
  "message": "Database connection failed after 3 retries",
  "trace_id": "abc-123-def-456",
  "request_id": "req-789-xyz",
  "endpoint": "/api/v1/login",
  "user_id": "usr-0042",
  "error_code": "DB_CONN_TIMEOUT",
  "duration_ms": 3041,
  "metadata": {
    "db_host": "postgres-primary.internal",
    "retry_count": 3
  }
}
```

### Razones para usar JSON

- Es parseable por todas las herramientas de logging modernas
- Permite búsqueda y filtrado por campo (ej. `level:ERROR AND service:auth-service`)
- Habilita agregaciones y dashboards automáticos
- Es compatible con estándares de OpenTelemetry
- Facilita la correlación de logs entre múltiples servicios

### Configuración recomendada por runtime

**Node.js (Pino)**
```javascript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME,
    environment: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

**Python (structlog)**
```python
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger().bind(
    service="my-service",
    environment=os.getenv("ENV", "development"),
)
```

---

## 3. Niveles de Logging

Los niveles de log representan la **severidad e intención** del evento registrado. Usar el nivel incorrecto genera ruido en producción o, peor, oculta errores reales.

### Tabla de referencia rápida

| Nivel | Uso | Ambientes habilitados |
|-------|-----|-----------------------|
| `TRACE` | Flujo interno de ejecución, paso a paso | Solo desarrollo local |
| `DEBUG` | Variables de estado, decisiones de lógica | Desarrollo y staging |
| `INFO` | Eventos normales del negocio | Todos |
| `WARN` | Situaciones anómalas no críticas | Todos |
| `ERROR` | Fallos recuperables que afectan una operación | Todos |
| `FATAL` | Fallos irrecuperables que detienen el servicio | Todos |

---

### TRACE

**Cuándo usarlo:** Para registrar el flujo interno de ejecución con alto nivel de detalle. Solo tiene sentido durante desarrollo activo de una funcionalidad nueva o debugging profundo de un algoritmo complejo.

**Regla:** Nunca debe llegar a staging ni producción. Debe estar deshabilitado por defecto.

```json
// ✅ Correcto
{
  "level": "TRACE",
  "message": "Entering password hash comparison",
  "algorithm": "bcrypt",
  "input_length": 12
}

// ❌ Incorrecto — TRACE con datos sensibles
{
  "level": "TRACE",
  "message": "Comparing passwords",
  "plain_password": "hunter2"
}
```

---

### DEBUG

**Cuándo usarlo:** Para registrar el estado de variables importantes, resultados intermedios de cálculos, o decisiones de lógica de negocio que ayudan a entender el comportamiento del sistema.

**Regla:** Puede habilitarse en staging ante un incidente específico, pero no en producción de forma permanente.

```json
// ✅ Correcto
{
  "level": "DEBUG",
  "message": "Cache miss — fetching from database",
  "cache_key": "user:profile:usr-0042",
  "ttl_seconds": 300
}

// ❌ Incorrecto — DEBUG para eventos que siempre ocurren y no aportan contexto
{
  "level": "DEBUG",
  "message": "Request received"
}
```

---

### INFO

**Cuándo usarlo:** Para registrar eventos normales y esperados del negocio. Son el "latido" del servicio — permiten confirmar que el sistema está funcionando correctamente.

**Regla:** Cada operación significativa del negocio debe generar al menos un `INFO`. No se debe abusar — no todo paso intermedio necesita un `INFO`.

```json
// ✅ Correcto
{
  "level": "INFO",
  "message": "User authentication successful",
  "user_id": "usr-0042",
  "auth_method": "jwt",
  "endpoint": "/api/v1/login"
}

// ✅ Correcto
{
  "level": "INFO",
  "message": "Payment processed successfully",
  "order_id": "ord-9910",
  "amount_usd": 149.99,
  "payment_method": "stripe"
}

// ❌ Incorrecto — demasiado granular, genera ruido
{
  "level": "INFO",
  "message": "Connecting to database"
}
```

---

### WARN

**Cuándo usarlo:** Para situaciones anómalas que el sistema puede manejar por sí solo, pero que merecen atención porque podrían escalar a un problema mayor. Un `WARN` no interrumpe la operación, pero es una señal de alerta temprana.

```json
// ✅ Correcto — situación manejada pero inusual
{
  "level": "WARN",
  "message": "Rate limit threshold approaching for user",
  "user_id": "usr-0042",
  "requests_last_minute": 85,
  "limit": 100
}

// ✅ Correcto — degradación de rendimiento
{
  "level": "WARN",
  "message": "Database query exceeded expected duration",
  "query": "get_user_orders",
  "duration_ms": 850,
  "threshold_ms": 500
}

// ❌ Incorrecto — esto es un ERROR, no un WARN
{
  "level": "WARN",
  "message": "Payment gateway returned 500"
}
```

---

### ERROR

**Cuándo usarlo:** Para fallos que afectan directamente la operación en curso. El sistema sigue funcionando (no cae), pero la solicitud actual falló. Todo `ERROR` debe ser revisado por el equipo.

**Regla:** Todo `ERROR` debe incluir suficiente contexto para que quien lo lea pueda entender qué pasó, por qué falló, y qué solicitud estaba siendo procesada.

```json
// ✅ Correcto
{
  "level": "ERROR",
  "message": "Failed to send verification email",
  "error_code": "SMTP_CONNECTION_REFUSED",
  "user_id": "usr-0042",
  "email_to": "[REDACTED]",
  "trace_id": "abc-123",
  "request_id": "req-456",
  "endpoint": "/api/v1/register"
}

// ❌ Incorrecto — no hay contexto
{
  "level": "ERROR",
  "message": "Something went wrong"
}
```

---

### FATAL

**Cuándo usarlo:** Para fallos irrecuperables que impiden que el servicio continúe funcionando. Un `FATAL` generalmente va seguido de un shutdown del proceso. Son eventos muy raros y de máxima prioridad.

```json
// ✅ Correcto
{
  "level": "FATAL",
  "message": "Cannot connect to database on startup — shutting down",
  "error_code": "DB_INIT_FAILED",
  "service": "order-service",
  "environment": "production",
  "db_host": "postgres-primary.internal"
}
```

---

## 4. Convenciones Obligatorias

### Campos estandarizados

Todos los logs deben incluir los campos marcados como **Obligatorio**. Los campos **Opcionales** deben incluirse cuando el contexto los hace relevantes.

| Campo | Tipo | Obligatorio | Descripción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `timestamp` | `string` (ISO 8601 UTC) | ✅ Sí | Momento exacto del evento | `"2026-05-14T18:22:10.543Z"` |
| `level` | `string` (enum) | ✅ Sí | Severidad del log | `"ERROR"` |
| `service` | `string` | ✅ Sí | Nombre del microservicio | `"auth-service"` |
| `environment` | `string` | ✅ Sí | Ambiente de ejecución | `"production"`, `"staging"`, `"development"` |
| `message` | `string` | ✅ Sí | Descripción clara del evento | `"User login failed — invalid credentials"` |
| `trace_id` | `string` | ✅ Sí* | ID de traza distribuida (OpenTelemetry) | `"abc-123-def-456"` |
| `request_id` | `string` | ✅ Sí* | ID único de la solicitud HTTP | `"req-789-xyz"` |
| `endpoint` | `string` | ✅ Sí* | Ruta del endpoint que generó el log | `"/api/v1/login"` |
| `error_code` | `string` | ✅ En errores | Código de error interno estandarizado | `"AUTH_INVALID_TOKEN"` |
| `user_id` | `string` | ⚙️ Cuando aplique | ID del usuario autenticado | `"usr-0042"` |
| `duration_ms` | `number` | ⚙️ Cuando aplique | Tiempo de ejecución en milisegundos | `342` |
| `http_status` | `number` | ⚙️ Cuando aplique | Código HTTP de respuesta | `401` |
| `metadata` | `object` | ⚙️ Cuando aplique | Contexto adicional estructurado | `{ "retry_count": 3 }` |

> `*` Obligatorio en logs asociados a una solicitud HTTP. En logs de procesos de background (workers, cron jobs), se reemplaza por `job_id` o similar.

### Convenciones de formato

**`timestamp`**
- Siempre en UTC
- Formato ISO 8601 con milisegundos: `2026-05-14T18:22:10.543Z`
- Nunca en formato local ni en timestamp Unix sin explicación

**`level`**
- Siempre en mayúsculas: `INFO`, no `info` ni `Info`

**`service`**
- Kebab-case: `auth-service`, `payment-processor`, `notification-worker`
- Debe coincidir con el nombre del servicio en el registro de servicios del proyecto

**`environment`**
- Valores permitidos: `development`, `staging`, `production`
- Debe ser inyectado vía variable de entorno, nunca hardcodeado

**`trace_id` y `request_id`**
- Deben ser propagados desde el gateway o el primer servicio que recibe la solicitud
- Formato UUID v4 o el estándar W3C Trace Context (`traceparent`)

**`error_code`**
- Formato `SCREAMING_SNAKE_CASE`: `DB_CONN_TIMEOUT`, `AUTH_TOKEN_EXPIRED`
- Debe existir en el catálogo de errores del proyecto (ver `docs/error-codes.md`)

---

## 5. Reglas de Seguridad

### Información que NUNCA debe registrarse

Los logs pueden ser accedidos por múltiples personas con distintos niveles de acceso (desarrolladores, SRE, auditores), y con frecuencia son almacenados en sistemas de terceros. Registrar datos sensibles en logs representa un riesgo de seguridad y puede violar regulaciones de privacidad (GDPR, Ley 1581 de Colombia).

#### Lista de campos prohibidos en logs

| Categoría | Ejemplos concretos |
|-----------|-------------------|
| Credenciales | Contraseñas, PINs, preguntas de seguridad |
| Tokens y secretos | JWT completos, API keys, OAuth tokens, refresh tokens, session IDs |
| Datos de pago | Números de tarjeta (PAN), CVV, datos bancarios completos |
| Datos personales sensibles | Número de documento completo, fecha de nacimiento, dirección completa |
| Secretos de infraestructura | Connection strings con credenciales, claves SSH, certificados |
| Datos médicos o biométricos | Cualquier información de salud, huellas digitales |

#### Ejemplos

```json
// ❌ INCORRECTO — expone token completo
{
  "level": "DEBUG",
  "message": "Validating token",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi..."
}

// ✅ CORRECTO — solo información de diagnóstico
{
  "level": "DEBUG",
  "message": "Validating token",
  "token_prefix": "eyJhbG...",
  "token_length": 237
}
```

```json
// ❌ INCORRECTO — expone contraseña
{
  "level": "ERROR",
  "message": "Login failed",
  "username": "john@example.com",
  "password": "MyP@ssword123"
}

// ✅ CORRECTO — identifica el usuario sin datos sensibles
{
  "level": "ERROR",
  "message": "Login failed — invalid credentials",
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "user_email_domain": "example.com",
  "endpoint": "/api/v1/login"
}
```

```json
// ❌ INCORRECTO — número de tarjeta en log
{
  "level": "INFO",
  "message": "Payment initiated",
  "card_number": "4111111111111111"
}

// ✅ CORRECTO — solo los últimos 4 dígitos (PCI-DSS compliant)
{
  "level": "INFO",
  "message": "Payment initiated",
  "card_last_four": "1111",
  "payment_method": "visa"
}
```

### Sanitización automática

Se recomienda implementar un sanitizador a nivel de la librería de logging que elimine o enmascare automáticamente campos conocidos como sensibles antes de emitir el log:

```javascript
// Ejemplo de lista de campos a sanitizar
const SENSITIVE_FIELDS = [
  'password', 'passwd', 'secret', 'token', 'access_token',
  'refresh_token', 'api_key', 'authorization', 'credit_card',
  'card_number', 'cvv', 'ssn', 'pin',
];
```

---

## 6. Buenas Prácticas

### Evitar spam de logs

El exceso de logs tiene consecuencias reales: aumenta los costos de almacenamiento, satura los sistemas de monitoreo, y hace difícil encontrar eventos relevantes.

**Reglas:**
- No loguear en loops de alta frecuencia sin control (cada iteración de un procesamiento masivo). En cambio, loguear el resultado al final del batch.
- No loguear eventos de salud del sistema a nivel `INFO` con alta frecuencia (ej. health checks cada 5 segundos). Usar `DEBUG` o deshabilitarlos.
- Usar sampling en logs de alta frecuencia cuando el 100% no agrega valor.

```javascript
// ❌ Incorrecto — log por cada ítem procesado
for (const item of items) {
  logger.info({ message: 'Processing item', item_id: item.id });
  await processItem(item);
}

// ✅ Correcto — log del resumen del batch
const results = await processBatch(items);
logger.info({
  message: 'Batch processing complete',
  total: items.length,
  success: results.success,
  failed: results.failed,
  duration_ms: results.duration,
});
```

### Evitar duplicación de logs

Un mismo evento no debe generar múltiples logs desde distintas capas del sistema (ej. el error se logea en el repositorio, en el servicio, y en el controller). Definir una capa de responsabilidad:

- **Capa de repositorio/datos:** Loguear solo errores de infraestructura (DB timeout, connection error) y re-lanzar la excepción.
- **Capa de servicio:** Loguear errores de negocio con contexto.
- **Capa de controller/handler:** Loguear el resultado final de la solicitud (éxito o error) con los datos de la request.

### Generar logs accionables

Un log accionable es aquel que permite al lector entender qué pasó y, si es un error, tomar una acción concreta. Preguntarse siempre: *¿Qué haría yo si veo este log a las 3am?*

```json
// ❌ No accionable
{ "level": "ERROR", "message": "Error" }

// ❌ No accionable — no hay contexto para actuar
{ "level": "ERROR", "message": "Request failed" }

// ✅ Accionable — sé exactamente qué pasó y dónde investigar
{
  "level": "ERROR",
  "message": "External payment gateway timeout — order not confirmed",
  "error_code": "PAYMENT_GATEWAY_TIMEOUT",
  "order_id": "ord-9910",
  "gateway": "stripe",
  "timeout_ms": 5000,
  "trace_id": "abc-123",
  "request_id": "req-456",
  "endpoint": "/api/v1/checkout/confirm"
}
```

### Redactar mensajes claros

- Usar oraciones en inglés, afirmativas y en pasado para eventos completados.
- Describir *qué pasó*, no *dónde estamos* en el código.
- Incluir el sujeto de la acción cuando no sea obvio.

```
// ❌ Malo
"here"
"got here"
"done"
"error occurred"

// ✅ Bueno
"User authentication successful"
"Failed to send email notification — SMTP unavailable"
"Order status updated to CONFIRMED"
"Database connection pool exhausted"
```

### Incluir contexto suficiente

Cada log debe poder ser leído de forma aislada, sin necesidad de buscar el log anterior para entender el contexto. Incluir siempre:
- El identificador de la entidad afectada (`user_id`, `order_id`, etc.)
- El `trace_id` y `request_id` para trazabilidad
- El `endpoint` cuando aplique
- Detalles del error que ayuden a reproducirlo o enrutarlo

### Mantener consistencia entre servicios

- Usar siempre los mismos nombres de campo (`user_id`, no `userId` en un servicio y `user_identifier` en otro).
- Compartir las constantes de niveles y error codes desde un paquete o módulo interno compartido.
- En arquitecturas de microservicios, propagar el `trace_id` en todas las llamadas internas (HTTP headers, mensajes de cola, etc.).

---

## 7. Ejemplos por Contexto

### Autenticación exitosa

```json
{
  "timestamp": "2026-05-14T18:22:10.543Z",
  "level": "INFO",
  "service": "auth-service",
  "environment": "production",
  "message": "User authentication successful",
  "trace_id": "abc-123-def-456",
  "request_id": "req-789-xyz",
  "endpoint": "/api/v1/login",
  "user_id": "usr-0042",
  "auth_method": "password",
  "duration_ms": 142
}
```

### Error de base de datos

```json
{
  "timestamp": "2026-05-14T18:22:11.021Z",
  "level": "ERROR",
  "service": "user-service",
  "environment": "production",
  "message": "Database query failed — connection timeout",
  "error_code": "DB_QUERY_TIMEOUT",
  "trace_id": "abc-123-def-456",
  "request_id": "req-789-xyz",
  "endpoint": "/api/v1/users/profile",
  "user_id": "usr-0042",
  "duration_ms": 5003,
  "metadata": {
    "query": "get_user_profile",
    "db_host": "postgres-primary.internal",
    "timeout_config_ms": 5000
  }
}
```

### Job de background

```json
{
  "timestamp": "2026-05-14T02:00:01.100Z",
  "level": "INFO",
  "service": "notification-worker",
  "environment": "production",
  "message": "Daily digest emails batch completed",
  "job_id": "daily-digest-2026-05-14",
  "total_users": 4821,
  "emails_sent": 4809,
  "emails_failed": 12,
  "duration_ms": 43201
}
```

### Advertencia de degradación de rendimiento

```json
{
  "timestamp": "2026-05-14T18:25:33.201Z",
  "level": "WARN",
  "service": "search-service",
  "environment": "production",
  "message": "Search query exceeded SLA threshold",
  "trace_id": "xyz-789",
  "request_id": "req-012",
  "endpoint": "/api/v1/search",
  "duration_ms": 1820,
  "sla_threshold_ms": 1000,
  "metadata": {
    "query_complexity": "high",
    "result_count": 500
  }
}
```

---

## 8. Checklist de Implementación

Usar esta lista antes de hacer merge de cualquier PR que incluya cambios en logging.

### Formato

- [ ] Los logs se emiten en formato JSON estructurado
- [ ] No hay `console.log`, `print`, ni concatenación manual de strings usada como log
- [ ] El campo `timestamp` está en formato ISO 8601 UTC

### Campos

- [ ] Todos los campos obligatorios están presentes (`timestamp`, `level`, `service`, `environment`, `message`)
- [ ] Los logs de solicitudes HTTP incluyen `trace_id`, `request_id`, y `endpoint`
- [ ] Los errores incluyen `error_code` del catálogo de errores del proyecto

### Niveles

- [ ] El nivel elegido corresponde a la severidad real del evento
- [ ] No hay logs `TRACE` o `DEBUG` hardcodeados para producción
- [ ] Los errores de negocio usan `ERROR`, no `WARN`

### Seguridad

- [ ] No se registran contraseñas, tokens completos, ni datos de tarjeta
- [ ] Los emails o documentos de identidad están enmascarados o ausentes
- [ ] No hay secrets o connection strings en los logs

### Calidad

- [ ] El campo `message` describe claramente qué pasó
- [ ] Los logs de error incluyen suficiente contexto para actuar sobre ellos
- [ ] No hay logs duplicados del mismo evento en distintas capas
- [ ] Los logs en loops o procesos de alta frecuencia están controlados

---

## Referencias

- [OpenTelemetry Logging Specification](https://opentelemetry.io/docs/specs/otel/logs/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Pino Logger (Node.js)](https://getpino.io/)
- [structlog (Python)](https://www.structlog.org/)
- [The Twelve-Factor App — Logs](https://12factor.net/logs)
- Catálogo interno de errores: `docs/error-codes.md` *(pendiente de creación)*
- Guía de instrumentación con OpenTelemetry: `docs/observability.md` *(pendiente de creación)*

---

*Este documento es propiedad del equipo DevOps/SRE. Para proponer cambios, abrir un PR con la etiqueta `docs/standards` y solicitar revisión del equipo.*
