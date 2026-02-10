# 🛠️ Documentación Técnica - Sistema BIA (v2.0)

Documentación dirigida a desarrolladores y administradores de sistemas.

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor desacoplada:

*   **Frontend (SPA)**: HTML5, CSS3, JavaScript (Vanilla).
    *   Librerías: Leaflet.js (Mapas), Chart.js (Gráficas), jsPDF (Reportes).
    *   Comunicación: Fetch API hacia el Backend.
*   **Backend (API REST)**: Django 5 + Django REST Framework.
    *   Autenticación: JWT (JSON Web Tokens).
    *   Base de Datos: SQLite (Nativo), compatible con PostgreSQL.

---

## 📂 Estructura de Directorios

```text
/
├── backend/                # Proyecto Django
│   ├── config/             # Configuración global (settings.py, urls.py)
│   ├── continuidad/        # App principal (Modelos, Vistas, Serializers)
│   ├── venv/               # Entorno Virtual Python
│   └── manage.py           # CLI de Django
├── frontend/               # Cliente Web
│   ├── css/                # Estilos
│   ├── js/                 # Lógica (map.js)
│   ├── index.html          # Dashboard
│   └── login.html          # Acceso
└── _VERSION_ANTERIOR.../   # Backup legacy
```

---

## 🚀 Despliegue (Deployment)

### Requisitos del Servidor
*   Python 3.10 o superior.
*   Servidor Web (Nginx/Apache) para servir el Frontend y hacer proxy al Backend.
*   Gunicorn (para ejecutar Django en producción).

### Pasos de Instalación

1.  **Clonar Repositorio**:
    ```bash
    git clone https://github.com/DIEGOTAPIA-S/Sistema-de-Gestion-Continuidad-del-Negocio-V2.git
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv venv
    ./venv/Scripts/activate  # o source venv/bin/activate en Linux
    pip install -r requirements.txt (generar previamente)
    python manage.py migrate
    python manage.py import_seed  # Carga datos iniciales
    ```

3.  **Configuración de Producción (`settings.py`)**:
    *   Cambiar `DEBUG = False`.
    *   Configurar `ALLOWED_HOSTS = ['midominio.com']`.
    *   Configurar Base de Datos (PostgreSQL recomendado).

---

## 🔌 API Endpoints

Todos los endpoints están prefijados con `/api/`.

| Método | Endpoint | Descripción | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/token/` | Obtener Token JWT (Login). | No |
| `POST` | `/api/token/refresh/` | Refrescar Token. | No |
| `GET` | `/api/sedes/` | Listar todas las sedes. | Sí |
| `POST` | `/api/sedes/` | Crear nueva sede. | Admin |
| `GET` | `/api/eventos/` | Historial de incidentes. | Sí |
| `GET` | `/api/users/` | Listar usuarios. | Admin |
