import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import Sidebar from '../components/Sidebar';
import DashboardCharts from '../components/DashboardCharts';
import EventHistoryModal from '../components/EventHistoryModal';
import FilterControl from '../components/FilterControl';
import SedeListModal from '../components/SedeListModal';
import AffectedListTable from '../components/AffectedListTable'; // New Component
import { getSedes } from '../services/sedeService';
import { createEvento } from '../services/eventoService';
import { generatePDFReport } from '../utils/reportGenerator';
import { toPng } from 'html-to-image';
import EarthquakeLayer from '../components/EarthquakeLayer'; // Importar capa de sismos
import WeatherLayer from '../components/WeatherLayer'; // Importar capa de clima
import NewsFeed from '../components/NewsFeed'; // Importar componente de noticias
import InstructionsModal from '../components/InstructionsModal'; // Importar modal de instrucciones
import EventRegistrationPanel from '../components/EventRegistrationPanel'; // Importar nuevo panel de eventos
import InfrastructureLayer from '../components/InfrastructureLayer'; // Importar capa de infraestructura

const MapDashboard = () => {
    const { user, logout } = useAuth();

    // Nueva gestión de estado para el formulario de eventos (Elevado desde Sidebar)
    const [eventDetails, setEventDetails] = useState({
        description: '',
        type: 'Servicios Públicos',
    });

    const handleEventChange = (e) => {
        const { name, value } = e.target;
        setEventDetails(prev => ({ ...prev, [name]: value }));
    };
    const [sedes, setSedes] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);

    // Analysis State
    // Analysis State
    const [zones, setZones] = useState([]);
    const [affectedSedes, setAffectedSedes] = useState([]);
    const [nearbySedes, setNearbySedes] = useState([]);

    const [showCharts, setShowCharts] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showHelp, setShowHelp] = useState(false); // Help Modal State
    const [showNews, setShowNews] = useState(false); // News Feed State

    // Layers Logic
    const [showEarthquakes, setShowEarthquakes] = useState(false);
    const [showWeather, setShowWeather] = useState(false); // Weather Layer State
    const [showTraffic, setShowTraffic] = useState(false); // Traffic State
    const [showInfrastructure, setShowInfrastructure] = useState(false); // Infrastructure State
    const [infrastructurePoints, setInfrastructurePoints] = useState([]); // Infrastructure Data
    const [earthquakeAlerts, setEarthquakeAlerts] = useState([]);
    const [emergencyAlert, setEmergencyAlert] = useState(null); // State for the popup
    const [focusLocation, setFocusLocation] = useState(null); // State for map FlyTo

    useEffect(() => {
        if (earthquakeAlerts.length > 0) {
            // Check for ANY events (Mag > 2.0) in the last hour
            // Lowered threshold as requested by user
            const critical = earthquakeAlerts.find(a => a.mag >= 2.0 && (Date.now() - a.time) < 3600000);
            if (critical) {
                setEmergencyAlert(critical);
                setShowEarthquakes(true); // Auto-show layer
            }
        }
    }, [earthquakeAlerts]);

    useEffect(() => {
        getSedes()
            .then(data => {
                if (Array.isArray(data)) {
                    setSedes(data);
                    setFilteredSedes(data);
                } else {
                    setSedes([]);
                    setFilteredSedes([]);
                }
            })
            .catch(err => {
                console.error("Error en MapDashboard:", err);
                setSedes([]);
                setFilteredSedes([]);
            });
    }, []);

    const handleFilter = (criteria) => {
        let result = [...sedes];
        if (criteria.search) {
            const term = criteria.search.toLowerCase();
            result = result.filter(s =>
                s.nombre.toLowerCase().includes(term) ||
                s.ciudad.toLowerCase().includes(term) ||
                (s.procesos && s.procesos.some(p => p.nombre.toLowerCase().includes(term)))
            );
        }
        if (criteria.criticality) {
            result = result.filter(s => s.procesos && s.procesos.some(p => p.criticidad === criteria.criticality));
        }
        if (criteria.minRto !== null) {
            result = result.filter(s => s.procesos && s.procesos.some(p => p.rto >= criteria.minRto));
        }
        if (criteria.maxRto !== null) {
            result = result.filter(s => s.procesos && s.procesos.some(p => p.rto <= criteria.maxRto));
        }
        setFilteredSedes(result);
    };

    const handleAnalysisUpdate = (affected, nearby, currentZones) => {
        setAffectedSedes(affected);
        setNearbySedes(nearby);
        if (currentZones) setZones(currentZones);
    };

    const handleGenerateReport = async () => {
        try {
            // Derived State for report
            const reportSedes = updatedSedesWithStatus();

            // Capture Map
            const mapElement = document.getElementById('map-capture');
            let mapImg = null;
            if (mapElement) {
                // Wait a moment for map to settle
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    // Using html-to-image which handles modern CSS (like oklch) better
                    mapImg = await toPng(mapElement, {
                        cacheBust: true,
                        width: mapElement.offsetWidth,
                        height: mapElement.offsetHeight,
                        // Avoid issues with webgl/canvas tainting
                        filter: (node) => !node.classList?.contains('leaflet-control-container')
                    });
                } catch (mapErr) {
                    console.error("Error capturing Map:", mapErr);
                    alert(`Error captura Mapa (html-to-image): ${mapErr.message}`);
                }
            } else {
                alert("Error: No se encontró el elemento del mapa en el DOM.");
            }

            // Capture Charts
            const chartsElement = document.getElementById('charts-capture');
            let chartsImg = null;
            if (showCharts) {
                if (chartsElement) {
                    try {
                        chartsImg = await toPng(chartsElement, { backgroundColor: '#ffffff' });
                    } catch (chartErr) {
                        console.error("Error capturing Charts:", chartErr);
                        alert(`Error captura Gráficas: ${chartErr.message}`);
                    }
                } else {
                    alert("Advertencia: Gráficas activas pero no encontradas para captura.");
                }
            }

            generatePDFReport(reportSedes, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg, infrastructurePoints);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Error general al generar el reporte: " + error.message);
        }
    };

    const handleSaveEvent = async () => {
        if (!eventDetails.description) {
            alert("Por favor ingrese una descripción del evento.");
            return;
        }
        if (affectedSedes.length === 0 && nearbySedes.length === 0) {
            if (!confirm("No hay sedes afectadas. ¿Desea guardar el evento de todos modos?")) return;
        }

        try {
            const eventoData = {
                tipo: eventDetails.type,
                descripcion: eventDetails.description,
                nivel_alerta: affectedSedes.length > 0 ? 'rojo' : (nearbySedes.length > 0 ? 'amarillo' : 'verde'),
                geometria: JSON.stringify(zones),
                sedes_afectadas_ids: [...affectedSedes, ...nearbySedes].map(s => s.id)
            };

            await createEvento(eventoData);
            alert("Evento registrado exitosamente.");
            setEventDetails({ ...eventDetails, description: '' });
        } catch (error) {
            alert("Error guardando evento. Verifique la consola.");
            console.error(error);
        }
    };

    // Derived Status for Charts/Lists
    const updatedSedesWithStatus = () => {
        return filteredSedes.map(s => {
            const isAffected = affectedSedes.some(a => a.id === s.id);
            const isNearby = nearbySedes.some(n => n.id === s.id);
            return {
                ...s,
                status: isAffected ? 'affected' : (isNearby ? 'nearby' : 'normal')
            };
        });
    };

    const sedesWithStatus = updatedSedesWithStatus();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{ height: '64px', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'white', borderRadius: '50%', padding: '5px', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>Sistema de Gestión Continuidad del Negocio</h1>
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Panel de Control</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block' }}>Bienvenido, {user?.name}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user?.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {user?.role === 'admin' && (
                            <a href="/admin" style={{ textDecoration: 'none' }}>
                                <button style={{ background: '#1e40af', border: '1px solid #1e3a8a', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    🛠️ Admin
                                </button>
                            </a>
                        )}
                        <button onClick={logout} style={{ background: '#dc2626', border: '1px solid #b91c1c', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🚪 Salir
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar
                    onEventChange={() => { }}
                    affectedSedes={affectedSedes}
                    nearbySedes={nearbySedes}
                    onSave={() => handleSaveEvent(eventDetails)}
                    onGenerateReport={handleGenerateReport}
                    onShowList={() => setShowList(true)}
                    onShowHistory={() => setShowHistory(true)}
                    onToggleCharts={() => setShowCharts(!showCharts)}
                    showCharts={showCharts}
                    onToggleEarthquakes={() => setShowEarthquakes(!showEarthquakes)}
                    showEarthquakes={showEarthquakes}
                    earthquakeAlerts={earthquakeAlerts}
                    onSimulateAlert={() => {
                        const mocks = [
                            { mag: 5.8, place: "Simulacro: 10km al Norte de Bogotá", coords: [4.81, -74.07] },
                            { mag: 6.2, place: "Simulacro: Volcán Galeras, Pasto", coords: [1.22, -77.37] },
                            { mag: 4.9, place: "Simulacro: Mesa de los Santos, Santander", coords: [6.79, -73.12] },
                            { mag: 5.5, place: "Simulacro: El Calvario, Meta (Epicentro Común)", coords: [4.36, -73.70] },
                            { mag: 6.0, place: "Simulacro: Costa Pacífica, Chocó", coords: [5.71, -77.27] },
                            { mag: 5.2, place: "Simulacro: Volcán Nevado del Huila", coords: [2.93, -76.03] },
                            { mag: 5.7, place: "Simulacro: Zona de Fallas, Armenia", coords: [4.53, -75.68] },
                            { mag: 4.5, place: "Simulacro: Sierra Nevada, Santa Marta", coords: [10.85, -73.80] }
                        ];
                        const randomMock = mocks[Math.floor(Math.random() * mocks.length)];
                        setEmergencyAlert({
                            mag: randomMock.mag,
                            place: randomMock.place,
                            time: Date.now(),
                            coordinates: [randomMock.coords[1], randomMock.coords[0]] // Store as [Lon, Lat] to match GeoJSON
                        });
                    }}
                    onToggleWeather={() => setShowWeather(!showWeather)}
                    showWeather={showWeather}
                    onToggleTraffic={() => setShowTraffic(!showTraffic)}
                    showTraffic={showTraffic}
                    onShowHelp={() => setShowHelp(true)}
                    onToggleNews={() => setShowNews(!showNews)}
                    showNews={showNews}
                    onToggleInfrastructure={() => setShowInfrastructure(!showInfrastructure)}
                    showInfrastructure={showInfrastructure}
                />

                {/* Right Content Area (Scrollable) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
                    {/* News Feed Overlay (Fixed: Pass isOpen prop) */}
                    {showNews && <NewsFeed isOpen={true} onClose={() => setShowNews(false)} />}

                    {/* Map Container (65% Height / Min 500px) */}
                    <div id="map-capture" style={{ height: '65vh', minHeight: '500px', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'relative' }}>
                        <MapComponent
                            sedes={filteredSedes}
                            onAnalysisUpdate={handleAnalysisUpdate}
                            focusLocation={focusLocation}
                        >
                            <EarthquakeLayer visible={showEarthquakes} onAlertsUpdate={setEarthquakeAlerts} />
                            <WeatherLayer visible={showWeather} sedes={sedes} />
                            <InfrastructureLayer visible={showInfrastructure} onUpdate={setInfrastructurePoints} />
                        </MapComponent>

                        {/* Waze Traffic Overlay */}
                        {showTraffic && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 2000,
                                background: 'white'
                            }}>
                                <iframe
                                    src="https://embed.waze.com/iframe?zoom=12&lat=4.711&lon=-74.072&ct=livemap"
                                    width="100%"
                                    height="100%"
                                    allowFullScreen
                                    style={{ border: 'none' }}
                                ></iframe>
                                <button
                                    onClick={() => setShowTraffic(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        zIndex: 2001,
                                        fontWeight: 'bold',
                                        borderRadius: '4px'
                                    }}
                                >
                                    ❌ Cerrar Tráfico
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Event Registration Panel (Below Map) */}
                    <div style={{ padding: '20px', background: '#f8fafc' }}>
                        <EventRegistrationPanel
                            eventDetails={eventDetails}
                            onChange={handleEventChange} // Correct prop name: onChange
                            onSave={handleSaveEvent}
                        />
                        {/* Helper to fix prop name: EventRegistrationPanel uses eventDetails and onEventChange directly?
                                        Checking previous code view of EventRegistrationPanel... yes.
                                        Wait, I removed handleEventChange function globally!
                                        So I need to pass (e) => setEventDetails(...) or re-add the simple setter.
                                    */}
                    </div>


                    {/* Event Summary Box (Above Charts) */}
                    {(affectedSedes.length > 0 || nearbySedes.length > 0) && (
                        <div style={{ margin: '0 20px', background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#0f172a' }}>
                                📢 Resumen del Evento: <span style={{ color: '#2563eb' }}>{eventDetails.type}</span>
                            </h3>
                            <p style={{ margin: 0, color: '#64748b' }}>
                                {eventDetails.description || 'Sin descripción proporcionada.'}
                            </p>
                        </div>
                    )}

                    {/* Charts & Details */}
                    {showCharts && (
                        <div style={{ padding: '20px' }}>
                            <div id="charts-capture">
                                <DashboardCharts sedes={sedesWithStatus} />
                            </div>
                            <AffectedListTable affectedSedes={affectedSedes} nearbySedes={nearbySedes} />
                        </div>
                    )}
                </div>
            </div>

            {showHistory && <EventHistoryModal onClose={() => setShowHistory(false)} />}
            {showList && <SedeListModal sedes={sedesWithStatus} onClose={() => setShowList(false)} />}
            {showHelp && <InstructionsModal onClose={() => setShowHelp(false)} />}

            {/* Emergency Popup Overlay */}
            {emergencyAlert && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#fff', borderLeft: '6px solid #dc2626', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, maxWidth: '400px', animation: 'slideIn 0.5s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, color: '#dc2626', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🚨 ALERTA SÍSMICA
                        </h2>
                        <button onClick={() => setEmergencyAlert(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#1e293b' }}>
                        Se ha detectado un sismo importante recientemente.
                    </p>
                    <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#991b1b' }}>Magnitud {emergencyAlert.mag}</p>
                        <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>{emergencyAlert.place}</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowEarthquakes(true);

                            let targetCoords = [4.71, -74.07]; // Default Bogota

                            if (emergencyAlert.place.includes("Simulacro")) {
                                // For mocks, we need to find the coords we set or infer them
                                if (emergencyAlert.place.includes("Bogotá")) targetCoords = [4.81, -74.07];
                                else if (emergencyAlert.place.includes("Pasto")) targetCoords = [1.22, -77.37];
                                else if (emergencyAlert.place.includes("Santander")) targetCoords = [6.79, -73.12];
                            } else if (emergencyAlert.coordinates) {
                                // Leaflet needs [Lat, Lon]. GeoJSON is [Lon, Lat, Depth]
                                targetCoords = [emergencyAlert.coordinates[1], emergencyAlert.coordinates[0]];
                            }

                            console.log("Setting focus to:", targetCoords);
                            setFocusLocation({ coords: targetCoords, timestamp: Date.now() });
                            setEmergencyAlert(null);
                        }}
                        style={{ width: '100%', background: '#dc2626', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Ver en Mapa
                    </button>
                    <style>{`
                        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default MapDashboard;
