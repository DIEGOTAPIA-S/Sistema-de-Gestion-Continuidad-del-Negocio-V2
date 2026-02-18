import React, { useState, useRef } from 'react';
import ColaboradorUpload from './ColaboradorUpload'; // Keeping for reference if needed, but likely removing usage
import { downloadColaboradoresCSV } from '../utils/exportUtils';
import { uploadColaboradoresExcel } from '../services/colaboradoresService';

const MapDrawer = ({
    activeTab,
    onClose,
    // Data Props
    affectedSedes,
    nearbySedes,
    affectedColaboradores,
    colaboradores,
    sedes,
    earthquakeAlerts,

    // Actions
    onEventChange,
    onSave,
    onGenerateReport,
    onShowList,
    onShowHistory,
    onSimulateAlert,
    onLocate,

    // Toggle States & Functions
    showCharts, onToggleCharts,
    showWeather, onToggleWeather,
    showTraffic, onToggleTraffic,
    showInfrastructure, onToggleInfrastructure,
    showColaboradores, onToggleColaboradores,
    showEarthquakes, onToggleEarthquakes,
    showNews, onToggleNews,
    onShowHelp
}) => {
    // Local state for Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    if (!activeTab) return null;

    const drawerStyle = {
        width: '400px',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1001,
        boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
        position: 'relative'
    };

    const headerStyle = {
        padding: '15px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
    };

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await uploadColaboradoresExcel(file);
            let msg = `✅ Carga Finalizada\n\nCreados: ${result.created}\nActualizados: ${result.updated}`;
            if (result.errors && result.errors.length > 0) {
                msg += `\n\n❌ Errores (${result.errors.length}):\n` + result.errors.slice(0, 5).join('\n');
            }
            alert(msg);
            // Optional: trigger refresh if needed
        } catch (error) {
            alert("❌ Error cargando archivo: " + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const contentStyle = {
        flex: 1,
        padding: '20px',
        overflowY: 'auto'
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Filter Sedes
        const matchedSedes = sedes.filter(s =>
            s.nombre.toLowerCase().includes(lowerQuery) ||
            s.direccion.toLowerCase().includes(lowerQuery)
        ).map(s => ({ ...s, type: 'sede', label: s.nombre, subLabel: s.direccion }));

        // Filter Colaboradores
        const matchedColabs = colaboradores.filter(c =>
            (c.nombres && c.nombres.toLowerCase().includes(lowerQuery)) ||
            (c.apellidos && c.apellidos.toLowerCase().includes(lowerQuery)) ||
            (c.cargo && c.cargo.toLowerCase().includes(lowerQuery)) ||
            (c.area && c.area.toLowerCase().includes(lowerQuery)) ||
            (c.compania && c.compania.toLowerCase().includes(lowerQuery))
        ).map(c => ({
            ...c,
            type: 'colaborador',
            label: `${c.nombres} ${c.apellidos}`,
            subLabel: `${c.cargo} - ${c.compania || ''}`
        }));

        setSearchResults([...matchedSedes, ...matchedColabs].slice(0, 50)); // More results allowed in Drawer
    };

    const handleSelectResult = (item) => {
        // setSearchQuery(''); // Optional: keep query
        // setSearchResults([]); 
        if (onLocate) onLocate(item);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'search':
                return (
                    <div>
                        <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Búsqueda Universal</h4>
                        <input
                            type="text"
                            placeholder="🔍 Buscar Sede, Colaborador, Cargo..."
                            value={searchQuery}
                            onChange={handleSearch}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        />
                        {searchResults.length > 0 && (
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: '15px 0 0',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                {searchResults.map((item, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleSelectResult(item)}
                                        style={{
                                            padding: '12px 15px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            gap: '12px',
                                            background: 'white',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {item.type === 'sede' ? '🏢' : '👤'}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.subLabel}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                No se encontraron resultados.
                            </div>
                        )}
                    </div>
                );
            case 'layers':
                return (
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
                            <button onClick={onToggleWeather} className={`btn-layer ${showWeather ? 'active-blue' : ''}`}>
                                <span style={{ fontSize: '1.5rem' }}>☁️</span>
                                <span>Clima</span>
                            </button>
                            <button onClick={onToggleTraffic} className={`btn-layer ${showTraffic ? 'active-orange' : ''}`}>
                                <span style={{ fontSize: '1.5rem' }}>🚗</span>
                                <span>Tráfico</span>
                            </button>
                            <button onClick={onToggleInfrastructure} className={`btn-layer ${showInfrastructure ? 'active-purple' : ''}`} style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '1.5rem' }}>🚑</span>
                                <span>Infraestructura / Ayuda</span>
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0', paddingTop: '15px' }}>
                            <button onClick={onToggleEarthquakes} className={`btn-layer ${showEarthquakes ? 'active-red' : ''}`} style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>🌋</span>
                                <span>{showEarthquakes ? 'Desactivar Capa de Sismos' : 'Activar Capa de Sismos'}</span>
                            </button>

                            {showEarthquakes && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                                    <button onClick={onSimulateAlert} style={{ width: '100%', padding: '8px', background: 'white', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginBottom: '10px' }}>
                                        ⚠️ Simular Alerta Sísmica
                                    </button>

                                    {earthquakeAlerts.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: 'bold', marginBottom: '5px' }}>
                                                {earthquakeAlerts.length} Sismos Recientes (24h)
                                            </div>
                                            {earthquakeAlerts.map((quake, idx) => (
                                                <div key={idx} style={{ background: 'white', padding: '8px', borderRadius: '6px', borderLeft: `4px solid ${quake.mag >= 5 ? '#dc2626' : '#f59e0b'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#991b1b' }}>M {quake.mag}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {new Date(quake.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#1e293b', margin: '4px 0' }}>{quake.place}</div>
                                                    <button
                                                        onClick={() => {
                                                            // Determine coordinates (Simulated vs Real)
                                                            let coords = quake.coordinates;
                                                            if (!coords && quake.place.includes("Simulacro")) {
                                                                // Fallback for simulation mocks if coords missing in object
                                                                if (quake.place.includes("Bogotá")) coords = [4.81, -74.07];
                                                                else if (quake.place.includes("Pasto")) coords = [1.22, -77.37];
                                                                else if (quake.place.includes("Santander")) coords = [6.79, -73.12];
                                                                else coords = [4.71, -74.07];
                                                            } else if (coords && coords.length === 3) {
                                                                // GeoJSON is [Lon, Lat], Leaflet needs [Lat, Lon]
                                                                // Wait, earthquakeAlerts from component usually come processed or raw?
                                                                // If from USGS GeoJSON: coordinates are [Lon, Lat, Depth]
                                                                // If from Simulation: might be [Lat, Lon]
                                                                // Let's assume [Lon, Lat] based on standard GeoJSON, but check simulation logic
                                                                // In main dashboard simulation: coords: [4.81, -74.07] (Lat, Lon)
                                                                // In EarthquakeLayer.jsx: features.geometry.coordinates is [Lon, Lat]
                                                                // We need to standardize.
                                                                // Safe bet: if abs(coords[0]) > abs(coords[1]) -> [Lon, Lat] (Colombia is Lat ~4, Lon ~-74)
                                                                // No, Lon is -74, Lat is 4. Abs(Lon) > Abs(Lat).

                                                                // Checking if it's already Lat,Lon or Lon,Lat is tricky without context.
                                                                // But typically `onLocate` expects { latitud, longitud } item or focusLocation expects [Lat, Lon]

                                                                // Let's try to construct a 'target' object compatible with onLocate
                                                            }

                                                            // Simplest interaction: Call onLocate with formatted item
                                                            // The Dashboard handleLocate expects: { latitud, longitud }

                                                            let lat, lon;
                                                            // Check if simulated (Lat, Lon)
                                                            if (Array.isArray(quake.coordinates)) {
                                                                if (quake.coordinates[1] < -20) {
                                                                    // Most likely [Lat, Lon] where Lon is ~-70
                                                                    lat = quake.coordinates[0];
                                                                    lon = quake.coordinates[1];
                                                                } else {
                                                                    // Most likely [Lon, Lat] (GeoJSON)
                                                                    lat = quake.coordinates[1];
                                                                    lon = quake.coordinates[0];
                                                                }
                                                            } else {
                                                                // Fallback for mocks
                                                                lat = 4.71; lon = -74.07;
                                                            }

                                                            onLocate({ latitud: lat, longitud: lon });
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px',
                                                            background: '#fee2e2',
                                                            color: '#b91c1c',
                                                            border: '1px solid #fecaca',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '5px'
                                                        }}
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

                        <style>{`
                            .btn-layer {
                                display: flex;
                                flexDirection: column;
                                alignItems: center;
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
                            .btn-layer:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
                            
                            .btn-layer.active-teal { background: #f0fdfa; border-color: #0d9488; color: #0d9488; }
                            .btn-layer.active-blue { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
                            .btn-layer.active-orange { background: #fff7ed; border-color: #ea580c; color: #ea580c; }
                            .btn-layer.active-purple { background: #f5f3ff; border-color: #7c3aed; color: #7c3aed; }
                            .btn-layer.active-red { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
                        `}</style>
                    </div>
                );
            case 'metrics':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Métricas y Análisis</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            <button onClick={onToggleCharts} className={`btn-layer ${showCharts ? 'active' : ''}`}>
                                <span style={{ fontSize: '1.5rem' }}>📊</span>
                                <span>{showCharts ? 'Ocultar Gráficas' : 'Ver Gráficas en Mapa'}</span>
                            </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px', textAlign: 'justify' }}>
                            Las métricas detalladas se muestran como un panel flotante sobre el mapa. Actívelas para ver estadísticas en tiempo real.
                        </p>
                    </div>
                );
            case 'data':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ margin: '0 0 10px', color: '#64748b' }}>Datos y Reportes</h4>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={onShowHistory} className="btn-layer">
                                <span style={{ fontSize: '1.5rem' }}>📜</span>
                                <span>Historial</span>
                            </button>

                            <button onClick={handleUploadClick} className="btn-layer" disabled={uploading}>
                                <span style={{ fontSize: '1.5rem' }}>{uploading ? '⏳' : '📤'}</span>
                                <span>{uploading ? 'Cargando...' : 'Cargar Personal'}</span>
                            </button>

                            {(affectedColaboradores.length > 0) && (
                                <button onClick={() => downloadColaboradoresCSV(affectedColaboradores)} className="btn-layer" style={{ gridColumn: 'span 2', borderColor: '#cbd5e1', background: '#f8fafc' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                                    <span>Descargar Lista Afectada</span>
                                </button>
                            )}
                        </div>

                        {/* Report Zone */}
                        {(affectedSedes.length > 0 || nearbySedes.length > 0) && (
                            <div style={{ padding: '15px', background: '#ffe4e6', borderRadius: '8px', border: '1px solid #fca5a5', marginTop: '10px' }}>
                                <h5 style={{ margin: '0 0 10px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem' }}>
                                    🚨 Zona de Riesgo Activa
                                </h5>
                                <div style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#7f1d1d' }}>
                                    <div style={{ marginBottom: '5px' }}>🏢 <strong>{affectedSedes.length}</strong> Sedes Afectadas</div>
                                    <div>👥 <strong>{affectedColaboradores.length}</strong> Empleados en Riesgo</div>
                                </div>

                                <p style={{ fontSize: '0.8rem', color: '#991b1b', fontStyle: 'italic', marginBottom: '15px' }}>
                                    * Estos datos serán incluidos automáticamente en el reporte. Utilice el panel principal para añadir descripción.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button onClick={() => onSave()} style={{ background: '#0f172a', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                        Guardar Evento
                                    </button>
                                    <button onClick={() => onGenerateReport({ includeColaboradoresList: true })} style={{ background: '#16a34a', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                        Generar PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div>
                        <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Configuración</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={onToggleNews} className={`btn-layer ${showNews ? 'active' : ''}`} style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '1.5rem' }}>📰</span>
                                <span>{showNews ? 'Ocultar Noticias' : 'Mostrar Noticias'}</span>
                            </button>
                            <button onClick={onShowHelp} className="btn-layer" style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '1.5rem' }}>❓</span>
                                <span>Ayuda / Manual</span>
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={drawerStyle}>
            <div style={headerStyle}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#334155' }}>
                    {activeTab === 'search' && 'Búsqueda'}
                    {activeTab === 'layers' && 'Capas & Visualización'}
                    {activeTab === 'metrics' && 'Métricas'}
                    {activeTab === 'data' && 'Datos & Reportes'}
                    {activeTab === 'settings' && 'Ajustes'}
                </h3>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                >
                    &times;
                </button>
            </div>
            <div style={contentStyle}>
                {renderContent()}
            </div>

            <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Continuidad de Negocio v2.1
            </div>
        </div>
    );
};

export default MapDrawer;
