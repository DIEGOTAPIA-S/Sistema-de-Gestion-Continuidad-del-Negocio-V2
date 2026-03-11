# 🏥 SGCN V2 — Sistema de Gestión de Continuidad del Negocio

Sistema avanzado para la gestión de la continuidad del negocio (BIA), monitoreo sísmico y visualización geoespacial.

---

## 📖 Documentación Maestras
Para reducir la confusión, hemos consolidado toda la información en dos documentos principales:

1.  **[Manual de Usuario](MANUAL_USUARIO.md)**: Guía paso a paso para el uso de la plataforma, roles (Admin/Analista), mapas y mantenimiento básico.
2.  **[Documentación Técnica](DOCUMENTACION_TECNICA.md)**: Stack tecnológico, arquitectura, guía de despliegue en producción (PostgreSQL/Nginx) y seguridad.

---

## 🚀 Inicio Rápido (Desarrollo)

Si ya tienes instalado Python y Node.js, usa los scripts simplificados en la raíz:

1.  **Backend**: Ejecuta `.\start_backend.ps1`
2.  **Frontend**: Ejecuta `.\start_frontend.ps1`

*La aplicación estará disponible en: [http://localhost:5173](http://localhost:5173)*

---

## 🛠️ Estructura del Proyecto
-   `/backend`: API Django (Lógica, Base de Datos, 2FA).
-   `/frontend-react`: Cliente moderno en React + Vite.
-   `/data`: Archivos de apoyo y geocodificación.

---
**Versión 2.5 — Marzo 2026**
