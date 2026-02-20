# 🛠️ Guía de Mantenimiento: Manteniendo tu App Sana

Esta guía explica cómo cuidar tu aplicación para que siga funcionando rápido y segura a lo largo del tiempo.

---

## 1. Copias de Seguridad (Backups) 💾
**¡Lo más importante!** El archivo `backend/db.sqlite3` es el corazón de tu app.

*   **¿Qué respaldar?**: El archivo `backend/db.sqlite3`.
*   **Frecuencia**: Recomendado **una vez al día** o antes de hacer un cambio importante.
*   **¿Cómo?**: Simplemente copia ese archivo y guárdalo en una carpeta externa (ej: OneDrive, Google Drive o un disco duro).
*   **En caso de error**: Si algo se rompe, borras el archivo dañado y pegas tu copia de seguridad. ¡Listo!

---

## 2. Actualización de "Ingredientes" (Librerías) 📦
Las librerías que usamos (Django, React, Leaflet) sacan versiones nuevas con mejoras.

### 🐍 Backend (Python/Django)
Para ver si hay actualizaciones y aplicarlas:
1.  Abre una terminal en la carpeta `backend/`.
2.  Asegúrate de que el entorno virtual esté activo.
3.  Escribe: `pip list --outdated` (te dirá qué está viejo).
4.  Para actualizar algo específico: `pip install --upgrade nombre-de-libreria`.

### ⚛️ Frontend (React/Vite)
1.  Abre una terminal en `frontend-react/`.
2.  Escribe: `npm outdated`.
3.  Para actualizar: `npm update`.

> [!WARNING]
> **OJO:** No actualices todo a lo loco. A veces una versión nueva cambia cómo funcionan las cosas y el código puede dejar de servir. Siempre haz un Backup antes.

---

## 3. Parches de Seguridad 🛡️
Cuando hay un error de seguridad grave en el mundo, Django suele sacar un parche.

*   **¿Cómo saber?**: Si ves noticias sobre "Vulnerabilidad en Django", es hora de actuar.
*   **Comando Maestro**: `pip install --upgrade django`. Esto te pondrá en la versión más segura disponible.

---

## 4. Limpieza de Datos 🧹
Tu base de datos puede llenarse de colaboradores de pruebas o de emergencias pasadas.

*   **Acción**: Usa el botón **"Borrar Base de Datos"** en el panel de Administrador del mapa (el que creamos recientemente).
*   **Por qué**: Mantiene la app rápida y respeta la privacidad de los empleados al no guardar sus datos sensibles más tiempo del necesario.

---

## 5. Revisión de Errores (Logs) 🔍
Si la app "no carga" o da error:

1.  Mira la **Ventana Negra (Terminal)** del Backend.
2.  Si ves letras rojas o palabras como `Error` o `Trackback`, ahí está la pista.
3.  **Consejo**: Copia ese error y pregúntame (o busca en Google). El 90% de las veces es un problema de conexión o un dato mal escrito en el Excel.

---

## 📅 Resumen de Rutina Sugerida
*   **Diario**: Verificar si el script `INICIAR_DEMO.bat` abre las 3 ventanas correctamente.
*   **Semanal**: Hacer una copia del archivo `db.sqlite3`.
*   **Mensual**: Revisar si hay actualizaciones de seguridad importantes.

¡Con esto tu app durará años! 🚀
