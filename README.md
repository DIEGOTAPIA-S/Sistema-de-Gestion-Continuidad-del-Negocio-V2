# 🏥 Sistema de Gestión Continuidad del Negocio (BIA) - Versión 2.5 (React Frontend)

Sistema avanzado para la gestión de la continuidad del negocio, análisis de impacto (BIA) y visualización geoespacial de sedes y riesgos.

> **Nueva Arquitectura v2.5**: Frontend modernizado con **React + Vite** y Backend en **Django REST Framework**.

## 🚀 Tecnologías

*   **Backend**: Python, Django 5, Django REST Framework.
*   **Base de Datos**: SQLite (Migrable a PostgreSQL/PostGIS).
*   **Frontend**: React 18, Vite, React Router, TailwindCSS (o similar).
*   **Mapas**: Leaflet.js + React-Leaflet + Turf.js (Análisis Espacial).
*   **Gráficos**: Recharts.
*   **Reportes**: jsPDF + AutoTable + html2canvas (Capturas de Pantalla).

## 📋 Requisitos Previos

*   **Node.js**: v18+ (Recomendado v20 LTS).
*   **Python**: v3.10+.
*   **Navegador Web Moderno**: Chrome, Firefox, Edge.

## ⚙️ Instalación y Ejecución

### 1. Configurar Backend (API)
El proyecto incluye un entorno virtual en `backend/venv`.

```bash
cd backend
# Activar entorno (Windows)
& ".\venv\Scripts\python.exe" manage.py runserver
```
El servidor API iniciará en: `http://127.0.0.1:8000/`

### 2. Ejecutar Frontend (React)
Abre una nueva terminal en la carpeta raíz del proyecto:

```bash
cd frontend-react
# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```
La aplicación web estará disponible en: `http://localhost:5173/` (o el puerto que indique Vite).

## 🔐 Credenciales de Acceso

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Control total, CRUD de usuarios/sedes, Panel Django. |
| **Analista** | *crear* | *crear* | Visualización de mapas, análisis de impacto, generación de reportes. |

## 🛠️ Funcionalidades Principales

1.  **Dashboard Geoespacial**: Visualización de sedes críticas en mapa interactivo.
2.  **Análisis de Impacto**:
    *   Dibujo de polígonos/zonas afectadas.
    *   Detección automática de sedes dentro (Afectadas) y cercanas (< 2km) al evento.
3.  **Reportes PDF Avanzados**:
    *   Generación de reportes con capturas de pantalla del mapa y gráficas.
    *   Tablas detalladas con RTO, RPO y Criticidad.
4.  **Historial de Eventos**: Registro y consulta de eventos pasados.
5.  **Métricas en Tiempo Real**: Gráficas de barras y pastel sobre el impacto del evento.
6.  **Admin Module**: Gestión de usuarios y sedes desde el frontend.

## 📂 Estructura del Proyecto

*   `/backend`: API Django y lógica de negocio.
*   `/frontend-react`: Nueva interfaz de usuario en React.
*   `/_VERSION_ANTERIOR_FASTAPI`: Respaldo (Legacy).
*   `/frontend`: Versión anterior en HTML estático (Legacy).
