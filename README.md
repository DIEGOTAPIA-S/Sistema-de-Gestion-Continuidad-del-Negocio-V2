# 🏥 Sistema de Continuidad del Negocio (BIA) - Versión 2.0

Sistema web para la gestión de la continuidad del negocio, análisis de impacto (BIA) y visualización geoespacial de sedes y riesgos.

> **Nueva Arquitectura v2.0**: Migración completa de FastAPI a **Django REST Framework**.

## 🚀 Tecnologías

*   **Backend**: Python, Django 5, Django REST Framework.
*   **Base de Datos**: SQLite (Migrable a PostgreSQL/PostGIS).
*   **Seguridad**: JWT (JSON Web Tokens) con Roles (Admin/Analista).
*   **Frontend**: HTML5, CSS3, Vanilla JavaScript.
*   **Mapas**: Leaflet.js + OpenStreetMap.
*   **Reportes**: jsPDF + AutoTable.

## 📋 Requisitos Previos

*   Python 3.10+
*   Navegador Web Moderno

## ⚙️ Instalación y Ejecución

### 1. Configurar Backend
El proyecto ya incluye un entorno virtual en `backend/venv`.

```bash
cd backend
# Activar entorno (Windows)
& ".\venv\Scripts\python.exe" manage.py runserver
```

El servidor iniciará en: `http://127.0.0.1:8000/`

### 2. Ejecutar Frontend
Simplemente abre el archivo `frontend/login.html` en tu navegador web.

## 🔐 Credenciales de Acceso

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Control total, CRUD de usuarios/sedes, Panel Django. |
| **Analista** | *crear* | *crear* | Visualización de mapas, generación de reportes PDF. |

## 🛠️ Funcionalidades Principales

1.  **Mapa Interactivo**: Visualización de sedes críticas.
2.  **Gestión de Incidentes**: Dibujo de zonas afectadas en el mapa (Círculos/Polígonos).
3.  **Cálculo de Impacto**: Análisis automático de sedes afectadas vs. procesos críticos (RTO/RPO).
4.  **Admin Module**: Gestión de usuarios y configuración de sedes desde el frontend.

## 📂 Estructura del Proyecto

*   `/backend`: API Django y lógica de negocio.
*   `/frontend`: Interfaz de usuario (HTML/JS/CSS).
*   `/_VERSION_ANTERIOR_FASTAPI`: Respaldo de la versión 1.0 (Legacy).
