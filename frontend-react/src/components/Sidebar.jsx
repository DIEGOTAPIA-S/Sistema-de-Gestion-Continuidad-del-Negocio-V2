import { useState } from 'react';

const Sidebar = ({
    onEventChange,
    affectedSedes,
    nearbySedes,
    onSave,
    onGenerateReport,
    onShowList,
    onShowHistory,
    onToggleCharts,
    showCharts,
    onToggleEarthquakes, // New prop
    showEarthquakes,     // New prop
    earthquakeAlerts = [], // New prop: List of alert strings/objects
    onSimulateAlert, // New prop: Function to trigger mock alert
    onToggleWeather, // New prop
    showWeather,      // New prop
    onToggleTraffic, // New prop
    showTraffic,      // New prop
    onShowHelp,       // New prop
    onToggleNews,    // New prop
    showNews         // New prop
}) => {
    const [eventDetails, setEventDetails] = useState({
        description: '',
        type: 'Sismo',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...eventDetails, [name]: value };
        setEventDetails(updated);
        onEventChange(updated);
    };

    return (
        <div className="sidebar" style={{ width: '350px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #e2e8f0', boxShadow: '2px 0 5px rgba(0,0,0,0.05)' }}>

            {/* Title */}
            <div style={{ padding: '20px 20px 10px 20px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>⚙️ Controles</h3>
            </div>

            {/* Action Buttons Section */}
            <div style={{ padding: '10px 20px 20px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={onShowList} className="btn-sidebar">
                    📋 Sedes
                </button>

                <button onClick={onToggleCharts} className={`btn-sidebar ${showCharts ? 'active' : ''}`}>
                    📊 {showCharts ? 'Ocultar' : 'Métricas'}
                </button>

                <button onClick={onToggleWeather} className={`btn-sidebar ${showWeather ? 'active-blue' : ''}`}>
                    ☁️ {showWeather ? 'Ocultar Clima' : 'Clima'}
                </button>

                <button onClick={onToggleTraffic} className={`btn-sidebar ${showTraffic ? 'active-orange' : ''}`}>
                    🚗 {showTraffic ? 'Ocultar Tráfico' : 'Tráfico'}
                </button>

                {/* Sismos Control Group */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={onToggleEarthquakes} className={`btn-sidebar ${showEarthquakes ? 'active-red' : ''}`} style={{ flex: 1, justifyContent: 'space-between' }}>
                        <span>⚡ {showEarthquakes ? 'Ocultar Sismos' : 'Sismos'}</span>
                        {earthquakeAlerts.length > 0 && <span style={{ background: 'white', color: '#e11d48', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{earthquakeAlerts.length}</span>}
                    </button>
                    {showEarthquakes && (
                        <button onClick={onSimulateAlert} className="btn-sidebar" style={{ width: '50px', padding: '0', fontSize: '1.2rem', justifyContent: 'center' }} title="Simular Alerta">
                            🔔
                        </button>
                    )}
                </div>

                <button onClick={onShowHistory} className="btn-sidebar">
                    📜 Historial
                </button>

                <button onClick={onGenerateReport} className="btn-sidebar btn-green" disabled={affectedSedes.length === 0}>
                    📥 PDF
                </button>

                <button onClick={onShowHelp} className="btn-sidebar" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
                    ❓ Ayuda
                </button>

                <button onClick={onToggleNews} className={`btn-sidebar ${showNews ? 'active' : ''}`} style={{ background: showNews ? '#e0f2fe' : 'white', color: showNews ? '#0284c7' : 'inherit', border: showNews ? '1px solid #7dd3fc' : '1px solid #e2e8f0' }}>
                    📰 Noticias
                </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>

                {/* Seismic Alerts Panel */}
                {showEarthquakes && (
                    <div style={{ marginBottom: '20px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#881337', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            ⚠️ Alertas Sísmicas (24h)
                        </h4>
                        {earthquakeAlerts.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                                {earthquakeAlerts.slice(0, 5).map((alert, idx) => (
                                    <li key={idx} style={{ padding: '8px 0', borderBottom: idx < 4 ? '1px solid #ffe4e6' : 'none', color: '#be123c' }}>
                                        <strong>M {alert.mag}</strong> - {alert.place} <br />
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Hace {Math.round((Date.now() - alert.time) / (1000 * 60 * 60))} horas</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: '#9f1239', margin: 0 }}>Sin sismos mayores recientes.</p>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .btn-sidebar {
                    padding: 10px 12px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #475569;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
                .btn-sidebar:hover { background: #f1f5f9; border-color: #94a3b8; }
                .btn-sidebar.active { background: #2563eb; color: white; border-color: #2563eb; }
                .btn-sidebar.active-red { background: #e11d48; color: white; border-color: #e11d48; animation: pulse 2s infinite; }
                .btn-sidebar.active-blue { background: #0ea5e9; color: white; border-color: #0ea5e9; }
                .btn-sidebar.active-orange { background: #f97316; color: white; border-color: #f97316; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); } 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }
                .btn-sidebar.btn-green { background: #10b981; color: white; border: none; }
                .btn-sidebar.btn-green:hover { background: #059669; }
                .btn-sidebar.btn-green:disabled { background: #a7f3d0; cursor: not-allowed; }
                .btn-sidebar.btn-dark { background: #0f172a; color: white; border: none; }
                .btn-sidebar.btn-dark:hover { background: #1e293b; }
            `}</style>
        </div>
    );
};

export default Sidebar;
