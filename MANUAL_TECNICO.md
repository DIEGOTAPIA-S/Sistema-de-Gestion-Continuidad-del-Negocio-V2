# 🛠️ Documentación Técnica - Sistema BIA (v2.5)

Documentación dirigida a desarrolladores y administradores de sistemas.

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura moderna de **Single Page Application (SPA)**:

*   **Frontend**: React 18 + Vite.
    *   Estilos: CSS Moderno (Variables CSS) / TailwindCSS (Opcional).
    *   Mapas: React-Leaflet + Turf.js para análisis geoespacial.
    *   Estado: Context API + Hooks.
*   **Seguridad**: 
    *   Auth: JWT (JSON Web Tokens).
    *   2FA: Autenticación de dos pasos con TOTP (Google/Microsoft Authenticator) y respaldo por Email.
    *   Hardening: Django-axes para bloqueo de IP/usuarios ante ataques.
*   **Base de Datos**: SQLite (Desarrollo) / PostgreSQL (Producción).

---

## 📂 Estructura de Directorios

```text
/
├── backend/                # API Django
│   ├── continuidad/        # Aplicación principal (Modelos, Vistas)
│   ├── config/             # Configuración del proyecto
│   └── manage.py           # Gestor de Django
├── frontend-react/         # Cliente React (Nuevo)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales
│   │   ├── services/       # Comunicación con API (Axios)
│   │   └── context/        # Estado global (Auth)
│   ├── public/             # Assets estáticos
│   └── vite.config.js      # Configuración de Build
└── ...                     # Archivos de configuración
```

> **Nota**: La carpeta `frontend` (sin el sufijo `-react`) pertenece a una versión anterior y puede ser eliminada.

---

## 🚀 Despliegue (Deployment)

### Requisitos
*   Node.js v18+
*   Python 3.10+

### Instalación

1.  **Backend**:
    ```bash
    cd backend
    python -m venv venv
    ./venv/Scripts/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver
    ```

2.  **Frontend**:
    ```bash
    cd frontend-react
    npm install
    npm run dev
    ```

El frontend estará disponible en `http://localhost:5173` y consumirá la API en `http://127.0.0.1:8000`.
