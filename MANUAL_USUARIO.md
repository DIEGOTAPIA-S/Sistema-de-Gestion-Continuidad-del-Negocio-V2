# 📘 Manual de Usuario - Sistema de Continuidad (v2.5)

Bienvenido al Sistema de Gestión de Continuidad del Negocio (BIA).

---

## 1. Acceso al Sistema

Para ingresar, acceda a la URL proporcionada por el administrador (ej. `http://localhost:5173` en local).

**Credenciales por defecto:**
*   Usuario: `admin`
*   Contraseña: `admin123` (o la asignada por sistemas)
*   **Segundo Factor (2FA)**: Al ingresar, si tiene el 2FA activo, deberá ingresar el código de 6 dígitos de su aplicación (Microsoft Authenticator) o solicitar envío por correo.

---

## 2. Configuración de Seguridad (2FA)

Para proteger su cuenta:
1. Ingrese a la pestaña **Seguridad** en el panel lateral.
2. Active el "Segundo Factor de Autenticación".
3. Escanee el código QR con **Microsoft Authenticator** (Verá el nombre "SG Continuidad").
4. Confirme el código inicial para activar.

### 🗺️ Dashboard Geoespacial
Visualice todas las sedes operativas en el mapa.
*   **Navegación**: Use el zoom y arrastre para explorar.
*   **Filtrado**: Use el panel lateral para buscar sedes por nombre o ciudad.

### ⚠️ Simulación de Eventos
Herramienta para analizar el impacto de desastres.
1.  **Dibujar Zona**: Seleccione la herramienta de dibujo (polígono/círculo) en el mapa.
2.  **Delimitar Área**: Dibuje la zona afectada sobre el mapa.
3.  **Resultados Automáticos**:
    *   El sistema identificará qué sedes están dentro del incidente.
    *   Se calculará el impacto financiero y operativo.

### 📊 Reportes
Genere informes PDF detallados con un solo clic, incluyendo capturas del estado actual del mapa y gráficos estadísticos.

---

## 3. Administración

El menú de administración permite:
*   Gestionar Usuarios y Roles.
*   Registrar nuevas Sedes y sus Coordenadas.
*   Definir Procesos Críticos de Negocio.

> Si necesita soporte, contacte al área de TI.
