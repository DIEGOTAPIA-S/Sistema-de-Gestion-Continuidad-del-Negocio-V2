# Manual de Usuario — SGCN v2
**Sistema de Gestión de Continuidad del Negocio**
*Versión 2 | Febrero 2026*

---

## 1. Acceso y Roles

Ingrese con sus credenciales corporativas (usuario + contraseña + código OTP de autenticación de dos factores).

| Rol | Capacidades |
|-----|-------------|
| **👮 Administrador** | Acceso total. Gestión de usuarios, sedes, procesos críticos y carga/borrado de datos de personal. |
| **🕵️ Analista** | Visualización de mapas, capas y alertas. Puede simular sismos y generar reportes. **No** ve datos de contacto sensibles. |

---

## 2. Interfaz Principal

La pantalla principal tiene tres áreas:

1. **Mapa Central:** Visor interactivo de Colombia con sedes, sismos y capas según configuración activa.
2. **Barra lateral izquierda (Dock):** Iconos de acceso rápido a herramientas.
3. **Panel deslizante (Drawer):** Se abre al seleccionar un icono del Dock.

### Iconos del Dock

| Icono | Función |
|-------|---------|
| 🗺️ Capas | Activa/desactiva Sismos, Clima, Tráfico, Personal, Infraestructura y Mapa de Calor |
| 📊 Métricas | Gráficas de impacto por ciudad y criticidad (visible tras análisis) |
| 📋 Sedes | Lista de todas las sedes con estado actual |
| 📜 Historial | Consulta y descarga de eventos pasados |
| 📥 PDF | Genera el reporte ejecutivo del evento actual |
| 📰 Noticias | Abre la Sala de Noticias |
| ❓ Ayuda | Abre este manual interactivo |

---

## 3. Capas de Monitoreo

| Capa | Fuente | Descripción |
|------|--------|-------------|
| ⚡ Sismos | USGS | Terremotos en tiempo real. Alerta automática si magnitud > 4.5 cerca de Colombia. |
| ☁️ Clima | Open-Meteo | Íconos de clima en cada sede. Radar de precipitaciones opcional. |
| 🚗 Tráfico | Waze | Estado de vías en tiempo real (solo lectura). |
| 👥 Personal | Backend propio | Colaboradores georeferenciados en campo. |
| 🏥 Infraestructura | OpenStreetMap | Hospitales, bomberos y policías cercanos a sedes afectadas. |
| 🔥 Mapa de Calor | Interno | Concentración visual de sedes/colaboradores/eventos. |

---

## 4. Sala de Noticias 📰

Accede desde el botón 📰 en el Dock. Muestra noticias en tiempo real clasificadas por categoría:

| Tab | Categoría | Contenido |
|-----|-----------|-----------|
| 🚨 | **Emergencia** | Incendios, explosiones, evacuaciones, fugas de gas en Bogotá |
| 🤝 | **Factores Sociales** | Protestas, paros, disturbios, huelgas, conflictos de orden público |
| 🌍 | **Factores Físicos/Ambientales** | Sismos, inundaciones, deslizamientos, vendavales, erupciones |
| 🔌 | **Servicios Públicos** | Cortes de agua/luz, apagones, fallas en acueducto, EPM, Codensa, EAAB, Emcali |
| 💻 | **Noticias IT** | Ciberataques, ransomware, brechas de seguridad, caídas de red |
| 🚦 | **Movilidad** | Cierres viales, accidentes, Transmilenio, bloqueos en Bogotá |

---

## 5. Flujos de Trabajo

### A. Protocolo de Emergencia (Sismo / Incidente)

1. **Alerta automática:** Si el sistema detecta un sismo > 4.5, aparece un popup rojo. Haga clic en él para ir a la zona.
2. **Activar capas:** Vaya a **Capas** → active *Sismos* y *Personal*.
3. **Dibujar zona o seleccionar área:** Use las herramientas de dibujo (izquierda del mapa) para marcar la zona afectada, o el sistema lo hará automáticamente al analizar.
4. **Ver resultados:**
   - 🔴 **Zona Roja:** Afectación directa
   - 🟡 **Zona Amarilla:** Radio cercano (< 2 km)
5. **Generar PDF:** Presione 📥 para el reporte ejecutivo con métricas y mapa.
6. **Guardar evento:** Presione 💾 para registrar el incidente formalmente en el historial.

### B. Gestión de Personal *(Solo Administrador)*

**Cargar datos:**
1. Ir al menú Datos → *Cargar Personal*
2. Seleccionar el Excel generado por la herramienta de Geocodificación
3. El sistema procesa y georreferencia los registros automáticamente

**Post-emergencia — Borrar datos:**
1. Datos → botón rojo **🗑️ Borrar Base**
2. Confirmar la acción
> ⚠️ Esta acción es **irreversible** y elimina todos los datos personales para proteger la privacidad.

### C. Simulacro de Sismo

1. Capas → **Simular Alerta** (ícono 🔔)
2. Seleccionar magnitud y ubicación de prueba
3. El sistema generará una alerta ficticia para validar los protocolos internos

---

## 6. Reporte PDF

El PDF generado incluye:
- Encabezado con fecha, tipo de evento y usuario generador
- Imagen del mapa en el momento del evento
- **4 tarjetas de métricas:** Sedes Totales, Afectación Directa, Sedes Cercanas, Impacto Crítico
- **Gráfica de barras** por ciudad (Total / Directa / Cercana)
- **Panel de criticidad** por nivel (Crítica, Alta, Media, Baja)
- Tabla detallada de sedes afectadas y cercanas (con procesos y RTO/MTPD)
- Lista de colaboradores en zona de riesgo *(si se activa la opción)*
- Red de apoyo cercana (hospitales, bomberos, policías por sede)
- Directorio de emergencias nacional

---

## 7. Mantenimiento Básico (Para el Usuario) 💾

Cuidar tu aplicación es sencillo siguiendo estos pasos:

*   **Copias de Seguridad**: El "corazón" de tus datos es el archivo `backend/db.sqlite3`. Cópialo una vez a la semana en una carpeta externa (como OneDrive o un disco duro).
*   **Limpieza de Datos**: Usa el botón **"Borrar Base de Datos"** en el panel de Administración del mapa para mantener la app rápida y proteger la privacidad.
*   **Si algo falla**: 
    1. Mira la ventana negra (terminal) del Backend. 
    2. Si ves errores, intenta cerrar todo y volver a iniciar con los scripts de la carpeta raíz.
    3. Verifica que el archivo `.env` tenga los datos correctos.

---

## 8. Preguntas Frecuentes

**¿Por qué me llevó al login al guardar cambios?**
En modo desarrollo, el servidor recarga la página automáticamente. En producción esto no ocurre.

**¿Las noticias son en tiempo real?**
Se actualizan cada vez que cambias de pestaña en la Sala de Noticias.

**¿Qué significa el color de un marcador de sede?**
- 🔵 Azul: Operativa (sin afectación)
- 🔴 Rojo: Afectación directa
- 🟡 Amarillo: En radio cercano (< 2km)

---
**Soporte**: Contacte al equipo de TI para reportar errores técnicos o solicitar nuevas funcionalidades.
