import { useState } from 'react';
import ColaboradorUpload from './ColaboradorUpload';

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
    showNews,         // New prop
    onToggleInfrastructure, // New prop
    showInfrastructure, // New prop
    onToggleColaboradores, // New prop
    showColaboradores, // New prop
    onSearchColaborador // New prop
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const containerStyle = {
        width: isCollapsed ? '70px' : '350px',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden' // Prevent content overflow during transition
    };

    const headerStyle = {
        padding: '20px',
        display: 'flex',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f1f5f9'
    };

    return (
        <div className="sidebar" style={containerStyle}>

            {/* Title & Toggle */}
            <div style={headerStyle}>
                {!isCollapsed && <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>⚙️ Controles</h3>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b', padding: '5px' }}
                    title={isCollapsed ? "Expandir" : "Contraer"}
                >
                    {isCollapsed ? '⇥' : '⇤'}
                </button>
            </div>

            {/* Action Buttons Section */}
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>

                <button onClick={onShowList} className="btn-sidebar" title="Sedes">
                    📋 {!isCollapsed && "Sedes"}
                </button>

                <button onClick={onToggleCharts} className={`btn-sidebar ${showCharts ? 'active' : ''}`} title="Métricas">
                    📊 {!isCollapsed && (showCharts ? 'Ocultar' : 'Métricas')}
                </button>

                <button onClick={onToggleWeather} className={`btn-sidebar ${showWeather ? 'active-blue' : ''}`} title="Clima">
                    ☁️ {!isCollapsed && (showWeather ? 'Ocultar Clima' : 'Clima')}
                </button>

                <button onClick={onToggleTraffic} className={`btn-sidebar ${showTraffic ? 'active-orange' : ''}`} title="Tráfico">
                    🚗 {!isCollapsed && (showTraffic ? 'Ocultar Tráfico' : 'Tráfico')}
                </button>

                <button onClick={onToggleInfrastructure} className={`btn-sidebar ${showInfrastructure ? 'active-purple' : ''}`} title="Infraestructura">
                    🚑 {!isCollapsed && (showInfrastructure ? 'Ocultar Ayuda' : 'Ayuda/Emergencia')}
                </button>

                <button onClick={onToggleColaboradores} className={`btn-sidebar ${showColaboradores ? 'active-teal' : ''}`} title="Colaboradores">
                    👥 {!isCollapsed && (showColaboradores ? 'Ocultar Personal' : 'Colaboradores')}
                </button>

                {/* Sismos Control Group */}
                <div style={{ display: 'flex', gap: '5px', flexDirection: isCollapsed ? 'column' : 'row' }}>
                    <button onClick={onToggleEarthquakes} className={`btn-sidebar ${showEarthquakes ? 'active-red' : ''}`} style={{ flex: 1, justifyContent: isCollapsed ? 'center' : 'flex-start' }} title="Sismos">
                        <span>⚡ {!isCollapsed && (showEarthquakes ? 'Ocultar Sismos' : 'Sismos')}</span>
                        {/* Notify Badge */}
                        {earthquakeAlerts.length > 0 && (
                            <span style={{
                                background: 'white',
                                color: '#e11d48',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                position: isCollapsed ? 'absolute' : 'static',
                                top: isCollapsed ? '0' : 'auto',
                                right: isCollapsed ? '0' : 'auto',
                                transform: isCollapsed ? 'scale(0.8)' : 'none'
                            }}>
                                {earthquakeAlerts.length}
                            </span>
                        )}
                    </button>
                    {showEarthquakes && (
                        <button onClick={onSimulateAlert} className="btn-sidebar" style={{ width: isCollapsed ? '100%' : '50px', padding: '5px', justifyContent: 'center' }} title="Simular Alerta">
                            🔔
                        </button>
                    )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '5px 0' }}></div>

                <button onClick={onShowHistory} className="btn-sidebar" title="Historial">
                    📜 {!isCollapsed && "Historial"}
                </button>

                <button onClick={onGenerateReport} className="btn-sidebar btn-green" disabled={affectedSedes.length === 0} title="Generar PDF">
                    📥 {!isCollapsed && "PDF"}
                </button>

                <div style={{ flex: 1 }}></div>

                <button onClick={onShowHelp} className="btn-sidebar" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }} title="Ayuda">
                    ❓ {!isCollapsed && "Ayuda"}
                </button>

                <button onClick={onToggleNews} className={`btn-sidebar ${showNews ? 'active' : ''}`} style={{ background: showNews ? '#e0f2fe' : 'white', color: showNews ? '#0284c7' : 'inherit', border: showNews ? '1px solid #7dd3fc' : '1px solid #e2e8f0' }} title="Noticias">
                    📰 {!isCollapsed && "Noticias"}
                </button>

                {/* Search Bar for Colaboradores - Only visible when expanded and layer active (optional condition) */}
                {!isCollapsed && (
                    <div style={{ marginTop: '10px', paddding: '5px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Buscar colaborador..."
                            onChange={(e) => onSearchColaborador && onSearchColaborador(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Expansible Alerts Panel (Bottom) - Only show if not collapsed or make it pop over? For now hide if collapsed to avoid mess */}
            {!isCollapsed && (
                <div style={{ padding: '0 10px 10px 10px', borderTop: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '10px 0 5px 0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Gestión de Personal</h4>
                    <ColaboradorUpload />
                </div>
            )}

            {!isCollapsed && (
                <div style={{ padding: '20px', overflowY: 'auto', borderTop: '1px solid #f1f5f9' }}>
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
            )}

            <style>{`
                .btn-sidebar {
                    padding: 10px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #475569;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: ${isCollapsed ? 'center' : 'flex-start'}; /* Center icons when collapsed */
                    gap: 12px; /* Consistent gap */
                    height: 42px; /* Fixed height for consistency */
                    position: relative;
                }
                .btn-sidebar:hover { background: #f1f5f9; border-color: #94a3b8; transform: translateY(-1px); }
                .btn-sidebar.active { background: #2563eb; color: white; border-color: #2563eb; }
                .btn-sidebar.active-red { background: #e11d48; color: white; border-color: #e11d48; animation: pulse 2s infinite; }
                .btn-sidebar.active-blue { background: #0ea5e9; color: white; border-color: #0ea5e9; }
                .btn-sidebar.active-orange { background: #f97316; color: white; border-color: #f97316; }
                .btn-sidebar.active-purple { background: #7c3aed; color: white; border-color: #7c3aed; }
                .btn-sidebar.active-teal { background: #0d9488; color: white; border-color: #0d9488; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); } 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }
                .btn-sidebar.btn-green { background: #10b981; color: white; border: none; }
                .btn-sidebar.btn-green:hover { background: #059669; }
                .btn-sidebar.btn-green:disabled { background: #a7f3d0; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Sidebar;
