import React from 'react';

/**
 * LayersTab — Control de capas del mapa: colaboradores, clima, tráfico,
 * infraestructura, sismos y mapa de calor.
 */
const LayersTab = ({
    showColaboradores, onToggleColaboradores,
    showHeatmap, onToggleHeatmap,
    showWeather, onToggleWeather,
    showTraffic, onToggleTraffic,
    showInfrastructure, onToggleInfrastructure,
    showEarthquakes, onToggleEarthquakes,
    earthquakeAlerts,
    onSimulateAlert,
    onLocate,
    onShowList,
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{ margin: '0 0 10px', color: '#64748b' }}>Control de Capas</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={onShowList} className="btn-layer">
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <span>Sedes</span>
            </button>
            <button onClick={onToggleColaboradores} className={`btn-layer ${showColaboradores ? 'active-teal' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <span>{showColaboradores ? 'Ocultar' : 'Personal'}</span>
            </button>
            <button onClick={onToggleHeatmap} className={`btn-layer ${showHeatmap ? 'active-orange' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>🔥</span>
                <span>{showHeatmap ? 'Ocultar' : 'Mapa Calor'}</span>
            </button>
            <button onClick={onToggleWeather} className={`btn-layer ${showWeather ? 'active-blue' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>☁️</span>
                <span>Clima</span>
            </button>
            <button onClick={onToggleTraffic} className={`btn-layer ${showTraffic ? 'active-orange' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>🚗</span>
                <span>Tráfico</span>
            </button>
            <button
                onClick={onToggleInfrastructure}
                className={`btn-layer ${showInfrastructure ? 'active-purple' : ''}`}
                style={{ gridColumn: 'span 2' }}
            >
                <span style={{ fontSize: '1.5rem' }}>🚑</span>
                <span>Red de apoyo</span>
            </button>
        </div>

        {/* Sismos */}
        <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0', paddingTop: '15px' }}>
            <button
                onClick={onToggleEarthquakes}
                className={`btn-layer ${showEarthquakes ? 'active-red' : ''}`}
                style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', gap: '10px' }}
            >
                <span style={{ fontSize: '1.5rem' }}>🌋</span>
                <span>{showEarthquakes ? 'Desactivar Capa de Sismos' : 'Activar Capa de Sismos'}</span>
            </button>

            {showEarthquakes && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <button
                        onClick={onSimulateAlert}
                        style={{ width: '100%', padding: '8px', background: 'white', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginBottom: '10px' }}
                    >
                        ⚠️ Simular Alerta Sísmica
                    </button>

                    {earthquakeAlerts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: 'bold', marginBottom: '5px' }}>
                                {earthquakeAlerts.length} Sismos Recientes (24h)
                            </div>
                            {earthquakeAlerts.map((quake, idx) => (
                                <div
                                    key={idx}
                                    style={{ background: 'white', padding: '8px', borderRadius: '6px', borderLeft: `4px solid ${quake.mag >= 5 ? '#dc2626' : '#f59e0b'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#991b1b' }}>M {quake.mag}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(quake.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#1e293b', margin: '4px 0' }}>{quake.place}</div>
                                    <button
                                        onClick={() => {
                                            let lat, lon;
                                            if (Array.isArray(quake.coordinates)) {
                                                if (quake.coordinates[1] < -20) {
                                                    lat = quake.coordinates[0]; lon = quake.coordinates[1];
                                                } else {
                                                    lat = quake.coordinates[1]; lon = quake.coordinates[0];
                                                }
                                            } else {
                                                lat = 4.71; lon = -74.07;
                                            }
                                            onLocate({ latitud: lat, longitud: lon });
                                        }}
                                        style={{ width: '100%', padding: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                    >
                                        📍 Ver en Mapa
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#be123c', textAlign: 'center' }}>
                            No hay sismos reportados en 24h.
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Estilos compartidos de botones de capa */}
        <style>{`
            .btn-layer {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 15px 10px;
                border: 1px solid #e2e8f0;
                background: white;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #475569;
                font-weight: 600;
                font-size: 0.9rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                gap: 8px;
            }
            .btn-layer:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-color: #cbd5e1; }
            .btn-layer.active-teal  { background: #f0fdfa; border-color: #0d9488; color: #0d9488; }
            .btn-layer.active-blue  { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
            .btn-layer.active-orange{ background: #fff7ed; border-color: #ea580c; color: #ea580c; }
            .btn-layer.active-purple{ background: #f5f3ff; border-color: #7c3aed; color: #7c3aed; }
            .btn-layer.active-red   { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
        `}</style>
    </div>
);

export default LayersTab;
