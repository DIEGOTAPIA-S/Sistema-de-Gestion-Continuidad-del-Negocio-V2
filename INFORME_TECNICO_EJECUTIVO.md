# Informe Técnico Ejecutivo
## Sistema de Gestión de Continuidad del Negocio (SGCN v2)

*Preparado para: Dirección / Gerencia*
*Fecha: Febrero 2026*
*Clasificación: Interno*

---

## 1. Descripción General del Sistema

El SGCN es una **plataforma web geoespacial** que permite a la organización monitorear, analizar y responder a eventos de riesgo que puedan afectar la operación de sus sedes. Integra en una sola pantalla: monitoreo sísmico en tiempo real, georeferenciación de colaboradores, análisis automático de impacto y generación de reportes ejecutivos en PDF.

**Tipo de aplicación:** Aplicación Web Progresiva (PWA-ready) — accesible desde cualquier navegador moderno sin instalación.

---

## 2. Stack Tecnológico

### 2.1 Frontend (Interfaz de Usuario)

| Componente | Tecnología | Versión | Licencia |
|-----------|-----------|---------|---------|
| Framework UI | **React** | 19.x | MIT (gratuita) |
| Build Tool | **Vite** | 7.x | MIT (gratuita) |
| Mapa Interactivo | **Leaflet / React-Leaflet** | 5.x | BSD-2 (gratuita) |
| Análisis Geoespacial | **Turf.js** | 7.x | MIT (gratuita) |
| Gráficas | **Recharts** | 3.x | MIT (gratuita) |
| Reportes PDF | **jsPDF + AutoTable** | 4.x / 5.x | MIT (gratuita) |
| Estilos | **TailwindCSS + DaisyUI** | 4.x | MIT (gratuita) |
| Cliente HTTP | **Axios** | 1.x | MIT (gratuita) |
| Lenguaje | **JavaScript (ES2022)** | — | — |

### 2.2 Backend (Servidor)

| Componente | Tecnología | Versión | Licencia |
|-----------|-----------|---------|---------|
| Framework Web | **Django** | 5.x | BSD (gratuita) |
| API REST | **Django REST Framework** | 3.x | BSD (gratuita) |
| Autenticación | **SimpleJWT** | — | MIT (gratuita) |
| Doble Factor (2FA) | **django-otp** | — | BSD (gratuita) |
| Protección Fuerza Bruta | **django-axes** | — | MIT (gratuita) |
| Auditoría de acciones | **django-auditlog** | — | MIT (gratuita) |
| Procesamiento Excel | **Pandas + OpenPyXL** | — | BSD (gratuita) |
| Geometría espacial | **Shapely** | 2.x | BSD (gratuita) |
| Noticias RSS | **feedparser** | — | BSD (gratuita) |
| Lenguaje | **Python** | 3.11+ | PSF (gratuita) |

### 2.3 Base de Datos

| Ambiente | Motor | Notas |
|----------|-------|-------|
| **Desarrollo (actual)** | **SQLite** | Integrado en Python, sin instalación adicional. Límite práctico ~1 GB. |
| **Producción (recomendado)** | **PostgreSQL 15+** | Gratuito, open source. Soporta concurrencia, backups automáticos y datos geoespaciales (PostGIS). |

---

## 3. APIs y Servicios Externos

Todas las APIs utilizadas actualmente son **gratuitas y sin clave de API**.

| Servicio | Proveedor | Dato | Frecuencia de actualización | ¿Requiere pago para escalar? |
|----------|-----------|------|-----------------------------|------------------------------|
| **Sismos** | USGS (EE.UU.) | Terremotos últimas 24h, globales | Se consulta **cada 5 min** automáticamente | No. Feed público universal. Para mayor detalle, el SGC Colombia tiene API propia (también gratuita). |
| **Clima** | Open-Meteo (Europa) | Temperatura, lluvia, viento por sede | Se consulta **cada 15 min** (cuando capa activa) | No hasta 10.000 req/día. Para uso intensivo: plan comercial EUR 10/mes. |
| **Radar de lluvia** | Open-Meteo | Modelo de precipitaciones | Se consulta **cada 10 min** (cuando activo) | Igual al anterior. |
| **Tráfico** | Waze / Google | Estado de vías en tiempo real | **Tiempo real** (~2 min, gestionado por Waze) | El embed de Waze es gratuito. La API de datos de Waze for Cities requiere convenio institucional (gratuito para gobiernos). |
| **Geocodificación / Búsqueda** | Nominatim (OpenStreetMap) | Conversión dirección → coordenadas | **Bajo demanda** (al buscar) | No hasta 1 req/seg. Para uso masivo: instancia propia de Nominatim o Google Maps API (USD 5/1000 req). |
| **Infraestructura emergencia** | OpenStreetMap / Overpass API | Hospitales, bomberos, policías | **Bajo demanda** (al analizar) | Gratuito. Datos comunitarios, pueden tardar días en actualizarse. |
| **Noticias** | RSS de medios colombianos | Titulares por categoría de riesgo | **Bajo demanda** (al cambiar pestaña) | Gratuito vía RSS. Para noticias con mejor precisión y tiempo real: API de Google News (USD 200/mes). |

---

## 4. Peso y Recursos de la Aplicación

### 4.1 Código fuente (repositorio)

| Componente | Tamaño en disco |
|-----------|----------------|
| Código backend (Python) | ~5 MB |
| Código frontend (JavaScript/CSS) | ~1 MB |
| Base de datos SQLite (datos actuales) | ~5–50 MB (crece con el uso) |
| **Total código + datos** | **~10–60 MB** |
| *(Dependencias descargadas — no van en producción)* | *(venv ~300 MB, node_modules ~250 MB)* |

### 4.2 Bundle de producción (lo que se descarga el usuario)

| Recurso | Tamaño estimado (comprimido) |
|---------|------------------------------|
| JavaScript (React + librerías) | ~2.5 MB |
| CSS (estilos) | ~150 KB |
| Imágenes / iconos | ~200 KB |
| **Total descarga inicial** | **~3 MB** |
| Carga subsiguiente (caché) | **~0 MB** (todo en caché del navegador) |

---

## 5. Opciones de Despliegue

### 5.1 On-Premise (Servidor Propio)

**¿Cuándo conviene?** Cuando la organización tiene políticas estrictas de datos internos, ya tiene infraestructura de servidores, o maneja información de colaboradores que no puede salir de la red corporativa.

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Almacenamiento | 20 GB | 50 GB (con backups y crecimiento de DB) |
| SO | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Software adicional | Nginx + Gunicorn + PostgreSQL | Nginx + Gunicorn + PostgreSQL + SSL (Let's Encrypt) |

**Costo estimado on-premise:**
- Hardware nuevo (servidor): COP 8–20 millones (una vez)
- Mantenimiento anual (electricidad + admin): COP 3–6 millones/año
- Licencias de software: **COP 0** (todo open source)

**Ventajas:** Control total, datos en red interna, sin dependencia de internet para el backend.
**Desventajas:** Requiere administrador de sistemas, backups manuales, sin alta disponibilidad automática.

---

### 5.2 Nube (Cloud) — Recomendado ✅

**¿Cuándo conviene?** Para la mayoría de organizaciones medianas. Se escala fácilmente, no requiere servidor físico, y los backups son automáticos.

#### Opción A — Bajo costo / MVP (actual)

| Componente | Servicio | Costo/mes |
|-----------|---------|-----------|
| Backend Django | **Railway** o **Render** (free tier) | USD 0–7 |
| Frontend React | **Vercel** o **Netlify** (free tier) | USD 0 |
| Base de datos PostgreSQL | **Railway** o **Supabase** (free tier) | USD 0–5 |
| Dominio .com.co | Registro anual | ~COP 50.000/año |
| SSL (HTTPS) | Let's Encrypt | **Gratuito** |
| **Total mensual estimado** | | **USD 0–12 / mes** |

#### Opción B — Producción Empresarial

| Componente | Servicio | Costo/mes |
|-----------|---------|-----------|
| Servidor backend | **AWS EC2 t3.small** o **Google Cloud e2-small** | USD 15–20 |
| Base de datos | **AWS RDS PostgreSQL** o **Google Cloud SQL** | USD 15–25 |
| Almacenamiento archivos | **AWS S3** o **GCS** | USD 1–5 |
| CDN Frontend | **CloudFront** o **Cloudflare** | USD 0–5 |
| Dominio + SSL | Route53 + ACM | USD 1–2 |
| **Total mensual estimado** | | **USD 35–60 / mes** |

> **Recomendación:** Comenzar con **Opción A (Railway + Vercel)** para validar el uso real. Migrar a **Opción B** cuando superen 50 usuarios concurrentes o requieran SLA garantizado.

---

## 6. Seguridad

| Mecanismo | Implementación actual |
|-----------|----------------------|
| Autenticación | JWT (tokens de acceso + refresco) |
| Doble factor (2FA) | Código TOTP por app (Google Authenticator, Authy) |
| Protección fuerza bruta | Bloqueo automático de IP tras intentos fallidos (django-axes) |
| Auditoría | Log de todas las acciones críticas (django-auditlog) |
| Control de roles | RBAC: Admin / Analista con permisos diferenciados |
| Comunicación | HTTPS (SSL/TLS) en cualquier despliegue |
| Datos sensibles | Teléfonos de colaboradores no expuestos al rol Analista |
| Política de datos | Colaboradores cargados como datos efímeros (se borran post-emergencia) |

---

## 7. Escalabilidad — Si el Proyecto Crece

### 7.1 APIs de pago que ampliarían capacidades

| Necesidad | API gratuita actual | Alternativa paga si escala |
|-----------|-------------------|---------------------------|
| Sismos más precisos Colombia | USGS (global) | **SGC Colombia** API (gratuita, más datos locales) |
| Clima tiempo real + alertas | Open-Meteo | **Tomorrow.io** (USD 25/mes) o **OpenWeatherMap Pro** (USD 40/mes) |
| Geocodificación masiva | Nominatim (1 req/seg) | **Google Maps API** (USD 5/1.000 req.) o **HERE Maps** (250k req/mes gratis) |
| Noticias en tiempo real | RSS feeds | **NewsAPI** (USD 449/mes empresarial) o **GDELT** (gratuito, académico) |
| Tráfico con datos estructurados | Waze embed | **Google Maps Traffic API** (USD por solicitud) o **INRIX** (licencia enterprise) |
| Notificaciones push móvil | No implementado | **Firebase FCM** (gratuito hasta 1M mensajes/mes) |
| Alertas sísmicas instantáneas | Polling cada 5 min | **WebSockets propios** + SGC Colombia (latencia < 30 seg) |

### 7.2 Infraestructura si escalan usuarios

| Usuarios concurrentes | Infraestructura sugerida | Costo aprox./mes |
|----------------------|--------------------------|-----------------|
| 1–20 usuarios | Railway/Render free tier | USD 0–15 |
| 20–100 usuarios | Cloud pequeño (AWS t3.small) | USD 40–80 |
| 100–500 usuarios | Cloud con balanceador de carga | USD 150–300 |
| +500 usuarios | Kubernetes / contenedores auto-escalables | USD 300+ |

---

## 8. Licencias y Cumplimiento

| Componente | Licencia | Restricciones |
|-----------|---------|--------------|
| React, Django, Leaflet | MIT / BSD | ✅ Uso comercial libre. Solo conservar atribución en código fuente. |
| TailwindCSS, DaisyUI | MIT | ✅ Uso comercial libre. |
| jsPDF, Recharts, Turf.js | MIT | ✅ Uso comercial libre. |
| Datos OpenStreetMap | ODbL (Open Database License) | ✅ Uso libre. Requiere atribución "© OpenStreetMap contributors" en el mapa (ya incluido en Leaflet por defecto). |
| USGS Earthquake data | Dominio público (EE.UU.) | ✅ Sin restricciones. |
| Open-Meteo | CC BY 4.0 | ✅ Uso libre incluso comercial. Solo atribución. |
| Waze Embed | Términos de Waze | ⚠️ Solo para uso de referencia. No se puede usar en app de terceros con fines lucrativos sin convenio. |

> **Conclusión de licencias:** El 100% de las librerías son **open source con licencia libre para uso comercial**. No hay dependencias con licencias restrictivas (GPL, AGPL) que obliguen a publicar el código del sistema.

---

## 9. Resumen Ejecutivo

| Criterio | Estado actual |
|---------|--------------|
| **Costo de desarrollo** | Herramientas y librerías 100% gratuitas |
| **Costo operativo (dev)** | COP 0 / mes |
| **Costo operativo (producción básica)** | USD 0–15 / mes |
| **Costo operativo (producción empresarial)** | USD 40–80 / mes |
| **Usuarios simultáneos soportados (actual)** | Hasta 20 sin configuración adicional |
| **Tiempo de respuesta del sistema** | < 1 segundo en red local |
| **Disponibilidad (cloud)** | 99.9% SLA en proveedores cloud tier 1 |
| **Portabilidad** | Funciona en cualquier servidor Linux o Windows con Python + Node.js |
| **Dependencia de internet** | Solo para APIs externas (sismos, clima, noticias). El mapa base funciona sin conexión con tiles en caché. |

---

*Elaborado con base en el código fuente activo del sistema. Versión del documento: 1.0 — Febrero 2026.*
