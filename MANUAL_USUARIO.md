# 📘 Manual de Usuario - Sistema de Continuidad (v2.0)

Este manual describe el funcionamiento del Sistema de Gestión de Continuidad del Negocio.

---

## 1. Acceso al Sistema

Para ingresar, abra el archivo `login.html` en su navegador o acceda a la URL desplegada.

### Roles de Usuario
*   **Analista**: Puede ver el mapa, buscar sedes, y simular eventos. No puede editar datos maestros.
*   **Administrador**: Tiene acceso total, incluyendo el módulo de gestión de usuarios y sedes.

---

## 2. Pantalla Principal (Mapa)

Al iniciar sesión, verá un mapa interactivo con todas las sedes de la organización.

### 📍 Marcadores
*   🔵 **Azul**: Sede Operativa Normal.
*   🔴 **Rojo**: Sede Afectada por un incidente.
*   🟡 **Amarillo**: Sede en riesgo cercano (Zona de alerta).
*   🟢 **Verde**: Sede fuera de peligro.

### 🔍 Buscador
En el panel izquierdo puede buscar sedes específicas por nombre o filtrar por procesos críticos (ej. "Nómina").

---

## 3. Simulación de Eventos (Incidentes)

El sistema permite simular desastres para calcular el impacto en el negocio (BIA).

1.  **Dibujar Zona Afectada**:
    *   Use las herramientas de dibujo en la parte superior izquierda del mapa (Círculo, Polígono, Cuadrado).
    *   Dibuje el área donde ocurrió el evento (ej. una inundación en el norte de la ciudad).
2.  **Ver Impacto**:
    *   El sistema automáticamente cambiará el color de los marcadores que caigan dentro de la zona.
    *   Aparecerá un panel inferior con el resumen:
        *   🔴 **Sedes Afectadas**: Totalmente inoperativas.
        *   🟡 **Sedes Cercanas**: En riesgo operativo.
3.  **Generar Reporte**:
    *   Seleccione el **Nivel de Alerta** y **Tipo de Evento** en el panel lateral.
    *   Haga clic en **"Generar Impacto"**.
    *   Haga clic en **"Descargar Informe"** para obtener un PDF técnico.

---

## 4. Módulo de Administración (Solo Admins)

Si usted es Administrador, verá el botón **"⚙️ Administración"** en el menú lateral. Este módulo permite:

### 👤 Gestión de Usuarios
*   **Crear**: Registre nuevos analistas o administradores.
*   **Editar**: Cambie contraseñas o roles.
*   **Eliminar**: Borre usuarios que ya no requieren acceso.

### 🏢 Gestión de Sedes y Procesos
*   **Editar Sede**: Modifique la ubicación (arrastrando en el mapa) o el nombre de una sede.
*   **Procesos BIA**: Asigne procesos críticos (ej. "Servidores") a las sedes y defina sus tiempos de recuperación (RTO/RPO).

---

## 5. Historial y Dashboard

*   **📈 Dashboard**: Muestra gráficas de vulnerabilidad por sede.
*   **📋 Historial**: Lista todos los eventos simulados anteriormente, permitiendo volver a descargar sus reportes PDF.
