import React, { useState } from 'react';

const InstructionsModal = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState('monitoreo');

    const sections = {
        monitoreo: '🗺️ Monitoreo',
        noticias: '📰 Sala de Noticias',
        herramientas: '⚙️ Herramientas',
        emergencia: '🚨 En Emergencia',
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 10000
        }}>
            <div style={{
                background: '#f8fafc', borderRadius: '14px', width: '92%', maxWidth: '860px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)', position: 'relative',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ background: '#0f172a', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>📖 Manual de Uso — SGCN v2</h2>
                    <button onClick={onClose} style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        fontSize: '2rem', 
                        cursor: 'pointer', 
                        lineHeight: 1, 
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                        padding: '5px'
                    }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.7}>×</button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', background: '#1e293b', borderBottom: '2px solid #334155' }}>
                    {Object.entries(sections).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            style={{
                                padding: '10px 20px', background: 'none', border: 'none',
                                color: activeSection === key ? '#38bdf8' : '#94a3b8',
                                borderBottom: activeSection === key ? '2px solid #38bdf8' : '2px solid transparent',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeSection === key ? '700' : '400',
                                marginBottom: '-2px', transition: 'color 0.2s'
                            }}
                        >{label}</button>
                    ))}
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '25px' }}>

                    {/* --- MONITOREO --- */}
                    {activeSection === 'monitoreo' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                { icon: '⚡', color: '#dc2626', title: 'Sismos (USGS)', desc: 'Muestra los últimos terremotos en tiempo real. Alerta automática si hay un sismo > 4.5 cerca de Colombia.' },
                                { icon: '☁️', color: '#0ea5e9', title: 'Clima (Open-Meteo)', desc: 'Visualiza íconos de clima en cada sede y activa el radar de precipitaciones para detectar riesgo por lluvia.' },
                                { icon: '🚗', color: '#f97316', title: 'Tráfico (Waze)', desc: 'Capa visual del estado de las vías. Solo lectura. Para marcar bloqueos usa las herramientas de dibujo del mapa.' },
                                { icon: '👥', color: '#7c3aed', title: 'Personal Georeferenciado', desc: 'Muestra los colaboradores en campo con su ubicación. Actívala para ver quién está en zona de riesgo.' },
                                { icon: '🏥', color: '#059669', title: 'Infraestructura de Emergencia', desc: 'Visualiza hospitales, bomberos y policías cercanos a las sedes afectadas. Se incluye en el reporte PDF.' },
                                { icon: '🔍', color: '#2563eb', title: 'Búsqueda en mapa', desc: 'Barra de búsqueda superior del mapa. Escribe una ciudad o dirección para navegar rápidamente.' },
                                { icon: '🔥', color: '#ea580c', title: 'Mapa de Calor', desc: 'Visualiza la concentración de sedes, colaboradores o eventos como una capa de intensidad térmica sobre el mapa.' },
                            ].map(item => (
                                <div key={item.title} style={{ background: 'white', borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${item.color}` }}>
                                    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{item.title}</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.83rem', lineHeight: 1.5 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- SALA DE NOTICIAS --- */}
                    {activeSection === 'noticias' && (
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>
                                La <strong>Sala de Noticias</strong> muestra alertas de medios en tiempo real clasificadas por tipo de riesgo. Ábrela con el botón <strong>📰</strong> en la barra lateral.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {[
                                    { icon: '🚨', color: '#dc2626', title: 'Emergencia', desc: 'Incendios, explosiones, evacuaciones, fugas de gas y colapsos en Bogotá.' },
                                    { icon: '🤝', color: '#7c3aed', title: 'Factores Sociales', desc: 'Protestas, paros, disturbios, vandalismo, huelgas y conflictos de orden público en Colombia.' },
                                    { icon: '🌍', color: '#16a34a', title: 'Factores Físicos/Ambientales', desc: 'Sismos, inundaciones, deslizamientos, vendavales, erupciones y sequías.' },
                                    { icon: '🔌', color: '#d97706', title: 'Servicios Públicos', desc: 'Cortes de agua/luz, apagones, racionamiento, fallas en acueducto, gas domiciliario y empresas como EPM, Codensa, EAAB, Emcali.' },
                                    { icon: '💻', color: '#0284c7', title: 'Noticias IT', desc: 'Ciberataques, hackeos, ransomware, brechas de seguridad, caídas de red y fallas de sistemas críticos.' },
                                    { icon: '🚦', color: '#64748b', title: 'Movilidad', desc: 'Cierres de vías, accidentes, bloqueos y estado del Transmilenio en Bogotá.' },
                                ].map(item => (
                                    <div key={item.title} style={{ background: 'white', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${item.color}` }}>
                                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                                        <div>
                                            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{item.title}</strong>
                                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- HERRAMIENTAS --- */}
                    {activeSection === 'herramientas' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {[
                                { icon: '📋', color: '#2563eb', title: 'Lista de Sedes', desc: 'Tabla completa de todas las sedes monitoreadas con su estado actual: Operativa, Afectada o Cercana.' },
                                { icon: '📊', color: '#7c3aed', title: 'Métricas', desc: 'Gráficos de distribución de riesgo: sedes afectadas por ciudad y criticidad de los procesos.' },
                                { icon: '📜', color: '#64748b', title: 'Historial de Eventos', desc: 'Consulta, filtra y descarga todos los eventos pasados registrados. Incluye un PDF histórico por evento.' },
                                { icon: '📥', color: '#dc2626', title: 'Generar Reporte PDF', desc: 'Crea un informe ejecutivo con: mapa del evento, estadísticas de impacto por ciudad, sedes afectadas y red de apoyo cercana.' },
                                { icon: '💾', color: '#059669', title: 'Guardar Evento', desc: 'Registra formalmente la incidencia. Requiere haber dibujado una zona en el mapa o seleccionado una alerta activa.' },
                                { icon: '🔔', color: '#f97316', title: 'Simulacro de Sismo', desc: 'Genera una alerta de prueba para verificar que el sistema de notificación funciona correctamente.' },
                            ].map(item => (
                                <div key={item.title} style={{ background: 'white', borderRadius: '10px', padding: '16px', display: 'flex', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${item.color}` }}>
                                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{item.title}</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.83rem', lineHeight: 1.5 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- EN EMERGENCIA --- */}
                    {activeSection === 'emergencia' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h3 style={{ color: '#dc2626', marginTop: 0, fontSize: '1rem' }}>🚨 Protocolo de Sismo</h3>
                                <ol style={{ paddingLeft: '20px', color: '#475569', fontSize: '0.88rem', lineHeight: 1.8 }}>
                                    <li>El sistema mostrará un <strong>popup rojo</strong> cuando detecte sismo &gt; 4.5.</li>
                                    <li>Ve a <strong>Capas</strong> → activa <em>Sismos</em> y <em>Personal</em>.</li>
                                    <li>El sistema dibujará la zona afectada automáticamente.</li>
                                    <li><strong>🔴 Zona Roja:</strong> Afectación directa.</li>
                                    <li><strong>🟡 Zona Amarilla:</strong> Radio cercano (&lt; 2 km).</li>
                                    <li>Presiona <strong>Generar PDF</strong> para el informe ejecutivo.</li>
                                    <li>Presiona <strong>Guardar Evento</strong> para registrarlo formalmente.</li>
                                </ol>
                            </div>
                            <div>
                                <h3 style={{ color: '#7c3aed', marginTop: 0, fontSize: '1rem' }}>👥 Gestión de Personal (Admin)</h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong style={{ color: '#334155', fontSize: '0.88rem' }}>📤 Cargar personal:</strong>
                                    <ol style={{ paddingLeft: '20px', color: '#475569', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '5px' }}>
                                        <li>Menú <strong>Datos</strong> → <em>Cargar Personal</em>.</li>
                                        <li>Selecciona el Excel de Geocodificación.</li>
                                        <li>El sistema procesa y georreferencia los registros.</li>
                                    </ol>
                                </div>
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
                                    <strong style={{ color: '#dc2626', fontSize: '0.85rem' }}>🗑️ Post-emergencia:</strong>
                                    <p style={{ color: '#7f1d1d', fontSize: '0.82rem', margin: '5px 0 0 0', lineHeight: 1.5 }}>
                                        Borra la base de datos personal desde <strong>Datos → Borrar Base</strong>. Esta acción es <em>irreversible</em> y protege la privacidad de los colaboradores.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 25px', borderTop: '1px solid #e2e8f0', textAlign: 'right', background: 'white' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#0f172a', color: 'white', border: 'none',
                            padding: '10px 28px', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.9rem'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
