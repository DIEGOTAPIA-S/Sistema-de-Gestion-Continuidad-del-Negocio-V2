import React from 'react';

const InstructionsModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '800px', // Wider layout as requested
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                position: 'relative',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >
                    ×
                </button>

                <h2 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    📖 Guía de Uso del Sistema
                </h2>

                <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', paddingRight: '10px' }}>

                    {/* Left Column: Monitoring */}
                    <div>
                        <h3 style={{ color: '#2563eb', fontSize: '1.1rem', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                            🌍 Monitoreo en Tiempo Real
                        </h3>

                        <div style={{ marginBottom: '20px' }}>
                            <strong style={{ color: '#f97316', display: 'block', marginBottom: '5px' }}>🚗 Tráfico (Waze)</strong>
                            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                                Activa una capa visual de Waze para consultar el estado de las vías.
                                <br /><em style={{ fontSize: '0.85rem' }}>Nota: Es una capa de solo lectura.</em>
                            </p>
                            <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #ffedd5' }}>
                                <strong>Para reportar un incidente:</strong>
                                <ol style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                    <li>Ubique visualmente el bloqueo en Waze.</li>
                                    <li><b>Oculte la capa de tráfico</b>.</li>
                                    <li>Use las herramientas de dibujo (izquierda del mapa) para marcar la zona.</li>
                                    <li>Guarde el evento como "Movilidad".</li>
                                </ol>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <strong style={{ color: '#e11d48', display: 'block', marginBottom: '5px' }}>⚡ Sismos (USGS)</strong>
                            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0' }}>
                                Muestra los últimos terremotos a nivel mundial.
                                <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                    <li><b>Alerta Roja:</b> Sismo {'>'} 2.0 en la última hora.</li>
                                    <li>Use el botón 🔔 para simular una alerta de prueba.</li>
                                </ul>
                            </p>
                        </div>

                        <div>
                            <strong style={{ color: '#0ea5e9', display: 'block', marginBottom: '5px' }}>☁️ Clima (Open-Meteo)</strong>
                            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0' }}>
                                Visualiza íconos de clima en cada sede y activa el radar de precipitaciones.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: General Controls */}
                    <div>
                        <h3 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                            ⚙️ Herramientas y Gestión
                        </h3>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📋</span>
                                <div>
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Sedes Totales</strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Abre un listado completo de todas las sedes monitoreadas con su estado actual (Operativa, Afectada, Cercana).
                                    </p>
                                </div>
                            </li>

                            <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📊</span>
                                <div>
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Métricas</strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Muestra gráficos estadísticos sobre el porcentaje de afectación de la red y criticidad de los procesos.
                                    </p>
                                </div>
                            </li>

                            <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📜</span>
                                <div>
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Historial</strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Permite consultar, filtrar y revisar todos los eventos pasados reportados en la plataforma.
                                    </p>
                                </div>
                            </li>

                            <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📥</span>
                                <div>
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Generar PDF</strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Crea un reporte oficial descargable que incluye: captura del mapa actual, listado de sedes afectadas y estadísticas.
                                    </p>
                                </div>
                            </li>

                            <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>💾</span>
                                <div>
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Guardar Evento</strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Registra formalmente la incidencia en la base de datos. Requiere haber dibujado una zona o seleccionado una alerta.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>

                <div style={{ marginTop: '20px', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            padding: '10px 25px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
