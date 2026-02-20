# 🗺️ Mapa del Proyecto: Guía para Navegar el Código

Este documento es un "Mapa del Tesoro" diseñado para ayudarte a entender dónde está cada cosa, especialmente si estás empezando en programación.

---

## 🌎 Los Dos Mundos (Arquitectura)
Tu aplicación está dividida en dos grandes carpetas. Imaginalo como un **Restaurante**:

### 1. 🖥️ Backend (La Cocina - Carpeta `backend/`)
Aquí es donde se guarda la comida (Base de datos) y se prepara (Lógica). El cliente no entra aquí, solo pide comida a través de una ventanilla (API).
*   **Lenguaje:** Python.
*   **Framework:** Django.

### 2. 🎨 Frontend (El Comedor - Carpeta `frontend-react/`)
Es lo que el cliente ve: las mesas, el menú, la decoración. Es la interfaz bonita con el Mapa.
*   **Lenguaje:** Javascript.
*   **Framework:** React + Vite.

---

## 📜 Las "Recetas" (Dependencias)
Como hablamos antes, no guardamos todas las librerías gigantes, sino las listas para descargarlas.

| Mundo | Archivo "Receta" | ¿Qué hace? |
| :--- | :--- | :--- |
| **Backend** | `backend/package.json`* | Lista las librerías de Python (Django, Pandas). |
| **Frontend** | `frontend-react/package.json` | Lista las librerías de React (Leaflet, Axios). |

> [!NOTE]
> *Nota: En Python solemos usar un archivo llamado `requirements.txt`, pero en tu caso usamos un `package.json` en la raíz que ayuda a gestionar todo.*

---

## 📂 Explorando las Carpetas

### 🟢 En `backend/` (El Cerebro)
*   `config/`: Contiene los ajustes maestros.
    *   `settings.py`: **EL ARCHIVO MÁS IMPORTANTE.** Aquí se activan las bases de datos, los permisos de seguridad y las reglas de contraseñas.
    *   `urls.py`: El "conmutador". Define qué direcciones web (rutas) existen en el servidor.
*   `continuidad/`: Aquí está la lógica de TU negocio.
    *   `models.py`: Define qué datos guardamos (Sedes, Empleados, Riesgos).
    *   `views.py`: Contiene las funciones que responden a las peticiones (ej: "Tráeme los sismos").
    *   `serializers.py`: Un "traductor". Convierte los datos de la base de datos a un formato que el Frontend entienda (JSON).
    *   `validators.py`: Donde pusimos las reglas de seguridad de las contraseñas.
*   `db.sqlite3`: El archivo de la **Base de Datos**. Aquí vive toda tu información.

### 🔵 En `frontend-react/` (La Cara)
*   `src/`: Aquí vive el código fuente.
    *   `pages/`: Las pantallas completas (Login, Dashboard de Mapa, Panel Admin).
    *   `components/`: Las piezas pequeñas que arman las páginas (El Dock lateral, las capas del mapa, los botones).
    *   `context/`: Donde guardamos cosas que toda la app debe saber (ej: ¿Quién inició sesión?).
    *   `services/api.js`: El mensajero que va a la cocina (Backend) a pedir datos.
    *   `index.css`: Donde vive la magia de los colores, degradados y animaciones.
*   `vite.config.js`: Ajustes de la herramienta que "cocina" el frontend. Aquí configuramos el proxy para que el frontend pueda hablar con el backend sin errores.

---

## 🔑 Archivos de Control (En la Raíz)
Estos archivos están afuera para que los encuentres rápido:
*   `INICIAR_DEMO.bat`: Tu lanzador de un solo clic.
*   `start_backend.ps1` / `start_frontend.ps1`: Los scripts que encienden cada parte por separado.
*   `MANUAL_USUARIO.md`: Guía para quien usa el mapa.
*   `technical_documentation.md`: Detalles profundos de servidores y seguridad.

---

## 🛠️ ¿Quieres cambiar algo? (Guía Rápida)
*   **¿Cambiar un color del mapa?** Ve a `frontend-react/src/index.css`.
*   **¿Agregar un campo nuevo a una Sede?** Empieza en `backend/continuidad/models.py`.
*   **¿Cambiar el texto del mensaje de Login?** Ve a `frontend-react/src/pages/Login.jsx`.
*   **¿Ajustar la seguridad?** Ve a `backend/config/settings.py`.

> [!TIP]
> Si alguna vez te pierdes, busca siempre la carpeta `src` en el frontend o la carpeta con el nombre de tu app (`continuidad`) en el backend. ¡Ahí está el 90% de tu trabajo!
