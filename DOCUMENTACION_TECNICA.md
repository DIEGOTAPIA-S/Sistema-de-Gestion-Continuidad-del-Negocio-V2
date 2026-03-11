# Documentación Técnica — SGCN v2
*Actualizada: Febrero 2026*

---

## 1. Visión General

El **SGCN (Sistema de Gestión de Continuidad del Negocio)** es una plataforma web geoespacial para monitorear, alertar y gestionar riesgos que afectan la operación de la compañía. Integra datos sísmicos en tiempo real, georeferenciación de colaboradores y generación automática de reportes ejecutivos.

---

## 2. Stack Tecnológico

### Frontend
| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.x | Framework UI |
| Vite | 7.x | Build tool / dev server |
| React-Leaflet | 5.x | Mapa interactivo |
| Turf.js | 7.x | Análisis geoespacial (polígonos, zonas) |
| Recharts | 3.x | Gráficas en dashboard |
| jsPDF + autoTable | 4.x / 5.x | Generación de PDF |
| html-to-image | 1.x | Captura DOM → imagen (mapa) |
| Axios | 1.x | Cliente HTTP |
| React Router | 7.x | Navegación |
| TailwindCSS + DaisyUI | 4.x | Estilos (parcial) |

### Backend
| Librería | Versión | Uso |
|----------|---------|-----|
| Django | 5.x | Framework web |
| Django REST Framework | 3.x | API REST |
| djangorestframework-simplejwt | — | Autenticación JWT |
| django-axes | — | Protección fuerza bruta |
| django-auditlog | — | Registro de acciones |
| django-otp / pyotp | — | 2FA (TOTP) |
| feedparser | — | Parseo de feeds RSS para noticias |
| pandas / openpyxl | — | Procesamiento de Excel de personal |
| shapely | 2.x | Cálculos geométricos (POINT, buffers) |
| Pillow | — | Procesamiento de imágenes (QR codes) |

### Base de Datos
- **Desarrollo:** SQLite (`db.sqlite3`)
- **Producción recomendada:** PostgreSQL

---

## 3. Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (React)                   │
│  MapDashboard → capas, análisis, PDF, noticias      │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST (JWT)
                     ▼
┌─────────────────────────────────────────────────────┐
│                Django REST API                       │
│  /api/sedes/ /api/colaboradores/ /api/eventos/       │
│  /api/news/  /api/auth/  /api/earthquakes/           │
└────────────────────┬────────────────────────────────┘
                     │
              ┌──────┴───────┐
              ▼              ▼
           SQLite       Servicios Externos
         (local dev)     USGS / Open-Meteo /
                         Nominatim / RSS feeds
```

---

## 4. Modelo de Datos

### `Sede`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombre | CharField | Nombre de la sede |
| direccion | CharField | Dirección física |
| ciudad | CharField | Ciudad |
| latitud / longitud | FloatField | Coordenadas geográficas |
| activa | BooleanField | Estado operativo |

### `Proceso` (→ Sede)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombre | CharField | Nombre del proceso |
| criticidad | CharField | Baja / Media / Alta / Crítica |
| rto | IntegerField | Recovery Time Objective (min) |
| rpo | IntegerField | Recovery Point Objective (min) |
| mtpd | IntegerField | Max Tolerable Period of Disruption |

### `Colaborador`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombres | CharField | Nombre completo |
| cargo | CharField | Cargo |
| area | CharField | Área/Departamento |
| modalidad | CharField | Presencial / Híbrido / Remoto |
| latitud / longitud | FloatField | Ubicación georeferenciada |
| telefono | CharField | ⚠️ Protegido — no expuesto a Analistas |

### `EventoIncidente`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| tipo | CharField | Tipo de evento (sismo, inundación, etc.) |
| descripcion | TextField | Descripción libre |
| geojson_zona | JSONField | Polígono de la zona afectada |
| fecha | DateTimeField | Timestamp del evento |
| generado_por | FK(User) | Usuario que creó el registro |

---

## 5. Seguridad y Roles (RBAC)

### Roles
- **admin:** Control total — CRUD usuarios, sedes, procesos; carga y borrado de datos de personal
- **analista:** Solo lectura + simulación de sismos + generación de reportes. Sin acceso a `telefono` de colaboradores

### Mecanismos de seguridad
| Mecanismo | Implementación |
|-----------|---------------|
| Autenticación | JWT (access + refresh tokens, SimpleJWT) |
| 2FA | TOTP via `django-otp` + QR code en primer login |
| Fuerza bruta | `django-axes` — bloqueo por IP + usuario tras X intentos |
| Auditoría | `django-auditlog` — registro de todas las acciones críticas |
| CORS | Configurado solo para `localhost:5173` en dev |

---

## 6. Endpoints API (Principales)

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|-----------|
| POST | `/api/auth/token/` | Login → access + refresh JWT | Público |
| POST | `/api/auth/token/refresh/` | Refrescar token | Autenticado |
| GET | `/api/sedes/` | Lista de sedes con procesos | Analista |
| GET/POST | `/api/colaboradores/` | Lista / carga de colaboradores | Admin |
| DELETE | `/api/colaboradores/borrar_todo/` | Borrar todos los colaboradores | Admin |
| GET | `/api/eventos/` | Historial de incidentes | Analista |
| POST | `/api/eventos/` | Registrar nuevo incidente | Analista |
| GET | `/api/news/` | Proxy RSS de noticias | Analista |
| GET | `/api/earthquakes/` | Proxy USGS sismos | Analista |

---

## 7. Servicios Externos

| Servicio | URL | Uso | Actualización | Limitaciones |
|----------|-----|-----|--------------|-------------|
| **USGS Earthquake** | `earthquake.usgs.gov/fdsnws/event/1/query` | Sismos en tiempo real | **Polling cada 5 min** automático (corre en background aunque la capa esté oculta). Feed `all_day.geojson` = últimas 24 horas. | Sin clave API; filtrado manual por bounding box de Colombia. Sin WebSocket → hay latencia de hasta 5 min en detectar un sismo nuevo. |
| **Open-Meteo (Clima)** | `api.open-meteo.com/v1/forecast` | Temperatura, código de clima y velocidad de viento por sede | **Polling cada 15 min** (solo cuando la capa clima está activa). Datos son del modelo NWP actualizado cada hora por Open-Meteo. | 1 petición por sede por ciclo → con muchas sedes puede ser lento. Sin clave API; gratuito. |
| **Open-Meteo (Radar)** | `api.open-meteo.com/v1/forecast` | Radar de precipitaciones | **Polling cada 10 min** cuando el radar está activo. | Resolución de ~11km. No es radar real sino modelo de precipitación. |
| **Waze Embed** | `embed.waze.com/...` | Capa de tráfico | **Tiempo real** — es un iframe de Waze, se actualiza solo en su propio ciclo interno (aprox. cada 2 min). No controlamos la frecuencia. | Solo visual; no expone datos estructurados. No hay API de extracción. |
| **Nominatim OSM** | `nominatim.openstreetmap.org/search` | Geocodificación y búsqueda en barra del mapa | **Bajo demanda** — solo cuando el usuario hace una búsqueda. Sin caché local. | Límite estricto: 1 req/seg por política de OSM. Datos de OSM actualizados por la comunidad (puede haber delays de días). |
| **Overpass API (OSM)** | `overpass-api.de/api/interpreter` | Infraestructura de emergencia (hospitales, bomberos, policías) | **Bajo demanda** — se consulta una vez al generar el análisis de impacto. Datos de OSM. | Datos estáticos de la comunidad OSM; pueden estar desactualizados en zonas rurales. No se refresca automáticamente. |
| **RSS / Noticias** | Proxy Django → fuentes RSS | Sala de Noticias por categoría | **Bajo demanda** — se consulta al cambiar de pestaña en la Sala de Noticias. Sin auto-refresh. Frescura depende de cada fuente RSS (tipicamente cada 15-30 min). | Calidad y disponibilidad variable por fuente. Sin WebSocket → requiere acción manual del usuario para refrescar. |

> **Resumen de frescura de datos:**
> | Dato | ¿Cuán actual es? |
> |------|-----------------|
> | Sismos | Máximo 5 min de retraso |
> | Clima | Máximo 15 min de retraso |
> | Radar lluvia | Máximo 10 min de retraso |
> | Tráfico (Waze) | ~2 min (gestionado por Waze) |
> | Noticias | Manual — al cambiar pestaña |
> | Infraestructura emergencia | Datos OSM comunitarios — puede tener días/semanas de retraso |

---

## 8. Instalación y Desarrollo Local

### Requisitos previos
- Python 3.11+
- Node.js 18+
- Git

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```powershell
cd frontend-react
npm install
npm run dev
```

### Variables de entorno (Backend)
Crear `backend/.env`:
```
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 9. Generación de PDF — Arquitectura

El PDF se genera 100% en el cliente (browser) usando **jsPDF + autoTable**. No requiere servidor.

**Flujo:**
1. `MapDashboard.jsx` → captura mapa con `html-to-image` (`.toPng()`)
2. Pasa mapa + datos de análisis a `reportGenerator.js`
3. `reportGenerator.js` dibuja natively con jsPDF:
   - Encabezado + metadata del evento
   - Imagen del mapa
   - 4 tarjetas de métricas (jsPDF `rect()`)
   - Gráfica de barras por ciudad (jsPDF `rect()` + `line()`)
   - Panel de criticidad con barras horizontales
   - Tablas de sedes afectadas/cercanas (`autoTable`)
   - Red de apoyo (hospitales, bomberos, policías)

> **Nota técnica:** Los charts de Recharts usan SVG, que no es serializable por `html-to-image` de forma confiable. Por eso las gráficas del PDF se dibujan con primitivas nativas de jsPDF en vez de captura de pantalla.

---

## 10. Deuda Técnica Conocida

| Ítem | Impacto | Prioridad |
|------|---------|-----------|
| `MapDashboard.jsx` > 658 líneas | Dificultad para mantener y debuggear | Alta |
| CSS mixto: DaisyUI oklch + inline | Causa fallos de captura DOM/PDF | Alta |
| Settings no separados por ambiente | Riesgo de exponer DEBUG=True en prod | Alta |
| Sin tests automatizados | Regresiones no detectadas | Media |
| Sin Docker | Onboarding de nuevos devs toma horas | Baja |
| Recharts (SVG) para PDF | Requiere workaround nativo | Media — migrar a Chart.js |
