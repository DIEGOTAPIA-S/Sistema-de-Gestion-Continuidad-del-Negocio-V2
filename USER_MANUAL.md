# 📖 Manual de Usuario - Sistema de Gestión Continuidad del Negocio (v2.5)

Este manual describe cómo utilizar las nuevas funcionalidades del sistema de continuidad del negocio.

## 1. Inicio de Sesión
- Accede a la aplicación (`http://localhost:5173`).
- Ingresa tus credenciales (Admin o Analista).
- Si eres Admin, verás un botón de configuración (⚙️) en el encabezado.

## 2. Panel de Control (Dashboard)

### 🗺️ El Mapa Interactivo
- **Navegación**: Usa el mouse o los controles (+/-) para moverte y hacer zoom.
- **Búsqueda**: Usa la barra superior izquierda para buscar una dirección o ciudad (ej: "Bogotá").
- **Capas**: Puedes cambiar entre vista de mapa y satélite (si está configurado).

### 🚨 Simulación de Eventos (Análisis de Impacto)
1.  **Dibujar Zona Afectada**:
    - Haz clic en el icono del **Polígono** o **Rectángulo** en la barra de herramientas del mapa (izquierda).
    - Dibuja el área del incidente sobre el mapa.
    - Haz doble clic para cerrar el polígono.
2.  **Resultados Automáticos**:
    - **Rojo**: Sedes dentro de la zona (Afectación Directa).
    - **Naranja**: Sedes a menos de 2km de la zona (Riesgo Cercano).
    - **Verde**: Sedes seguras.
3.  **Resumen**: Un cuadro aparecerá sobre las gráficas con el resumen del evento.

### 📊 Gráficas y Métricas
- Haz clic en el botón **"📊 Estadísticas"** en la barra lateral.
- Se desplegarán métricas clave:
    - Total de Sedes Afectadas vs. Cercanas.
    - Gráfica de Barras por Ciudad.
    - Gráfica de Pastel por Criticidad.

### 📄 Generación de Reportes PDF
1.  Asegúrate de haber dibujado una zona y tener datos visibles.
2.  (Opcional) Abre las gráficas si quieres que aparezcan en el reporte.
3.  Haz clic en **"📄 Generar Reporte PDF"** en la barra lateral.
4.  El sistema capturará el estado actual del mapa y las gráficas y descargará un archivo PDF completo.

### 💾 Guardar Evento
- Ingresa un **Tipo de Evento** (Sismo, Inundación, etc.) y una **Descripción** en la barra lateral.
- Haz clic en **"💾 Guardar Evento"**.
- El evento quedará registrado en el historial para futuras consultas.

## 3. Historial de Eventos
- Haz clic en **"📜 Historial"** en la barra lateral.
- Verás una lista de todos los eventos registrados.
- Puedes descargar el reporte PDF de cualquier evento pasado haciendo clic en el icono de descarga.

## 4. Listado de Sedes
- Haz clic en **"📋 Listado Sedes"** para ver una tabla completa de todas las sedes registradas.
- La tabla muestra detalles de **RTO** (Tiempo Objetivo de Recuperación) y **MTPD** (Punto Objetivo de Recuperación) por separado.

## 5. Administración (Solo Admins)
- Haz clic en el engranaje (⚙️) en el encabezado.
- **Usuarios**: Crea, edita o elimina usuarios del sistema.
- **Sedes**: Agrega nuevas sedes ubicándolas directamente en el mapa.

---
**Soporte**: Contacte al equipo de TI para reportar errores o solicitar nuevas funcionalidades.
