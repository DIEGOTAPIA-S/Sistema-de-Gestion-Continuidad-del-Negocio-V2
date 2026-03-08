import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import Sidebar from '../components/Sidebar';
import DashboardCharts from '../components/DashboardCharts';
import MetricsDashboard from '../components/MetricsDashboard';
import EventHistoryModal from '../components/EventHistoryModal';
import FilterControl from '../components/FilterControl';
import SedeListModal from '../components/SedeListModal';
import AffectedListTable from '../components/AffectedListTable';
import { getSedes } from '../services/sedeService';
import { createEvento, getEventos } from '../services/eventoService';
import { generatePDFReport } from '../utils/reportGenerator';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { fetchInfrastructureNearPoint } from '../services/infrastructureService';
import EarthquakeLayer from '../components/EarthquakeLayer';
import WeatherLayer from '../components/WeatherLayer';
import NewsFeed from '../components/NewsFeed';
import InstructionsModal from '../components/InstructionsModal';
import EventRegistrationPanel from '../components/EventRegistrationPanel';
import InfrastructureLayer from '../components/InfrastructureLayer';
import ColaboradoresLayer from '../components/ColaboradoresLayer';
import HeatmapLayer from '../components/HeatmapLayer';
import { fetchColaboradores } from '../services/colaboradoresService';
import { downloadColaboradoresCSV } from '../utils/exportUtils';
import { booleanPointInPolygon, point } from '@turf/turf';
import useIdleTimer from '../hooks/useIdleTimer';

const MapDashboard = () => {
    const { user, logout } = useAuth();

    // Auto-logout por inactividad de 30 minutos
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    const [idleCountdown, setIdleCountdown] = useState(120); // 2 minutos en segundos

    useIdleTimer({
        onWarning: useCallback(() => {
            setShowIdleWarning(true);
            setIdleCountdown(120);
        }, []),
        onLogout: useCallback(() => {
            setShowIdleWarning(false);
            logout();
        }, [logout]),
        idleMinutes: 28,
        warningMinutes: 2,
    });

    // Cuenta regresiva del aviso de inactividad
    useEffect(() => {
        if (!showIdleWarning) return;
        if (idleCountdown <= 0) { logout(); return; }
        const t = setTimeout(() => setIdleCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [showIdleWarning, idleCountdown, logout]);


    // Estado del formulario de eventos
    const [eventDetails, setEventDetails] = useState({
        description: '',
        type: 'Servicios Públicos',
        nivel_alerta: 'verde',
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
    const [showMetricsPanel, setShowMetricsPanel] = useState(false); // Dashboard de métricas
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

    // Colaboradores State
    const [showColaboradores, setShowColaboradores] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [colaboradores, setColaboradores] = useState([]);
    const [loadingColaboradores, setLoadingColaboradores] = useState(false); // ← NUEVO: indicador de carga
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Colaboradores
    const filteredColaboradores = colaboradores.filter(c => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (c.nombres && c.nombres.toLowerCase().includes(term)) ||
            (c.apellidos && c.apellidos.toLowerCase().includes(term)) ||
            (c.cargo && c.cargo.toLowerCase().includes(term)) ||
            (c.area && c.area.toLowerCase().includes(term)) ||
            (c.compania && c.compania.toLowerCase().includes(term)) ||
            (c.identificacion && c.identificacion.includes(term))
        );
    });

    // Lazy loading: descarga colaboradores SOLO cuando el usuario activa la capa
    // Así la app abre rápido y solo paga el costo de red cuando se necesita
    useEffect(() => {
        if ((showColaboradores || showHeatmap) && colaboradores.length === 0) {
            setLoadingColaboradores(true); // Mostrar indicador
            fetchColaboradores()
                .then(data => setColaboradores(data))
                .catch(err => console.error("Error loading colaboradores:", err))
                .finally(() => setLoadingColaboradores(false)); // Ocultar indicador
        }
    }, [showColaboradores, showHeatmap]);

    useEffect(() => {
        if (earthquakeAlerts.length > 0) {
            // Check for ANY events (Mag >= 2.0) in the last hour
            // Lowered threshold as requested by user
            const critical = earthquakeAlerts.find(a => a.mag >= 2.0 && (Date.now() - a.time) < 3600000);
            if (critical && !emergencyAlert) {
                setEmergencyAlert(critical);
                setShowEarthquakes(true); // Auto-show layer
            }
        }
    }, [earthquakeAlerts]);

    // Calculate Affected Colaboradores
    const [affectedColaboradores, setAffectedColaboradores] = useState([]);

    useEffect(() => {
        if (zones && zones.length > 0 && colaboradores.length > 0) {
            const affected = colaboradores.filter(c => {
                if (!c.latitud || !c.longitud) return false;
                const pt = point([c.longitud, c.latitud]); // Turf uses [Lon, Lat]
                return zones.some(zone => booleanPointInPolygon(pt, zone));
            });
            setAffectedColaboradores(affected);
        } else {
            setAffectedColaboradores([]);
        }
    }, [zones, colaboradores]);

    useEffect(() => {
        getSedes()
            .then(data => {
                console.log("Sedes fetched successfully:", data); // DEBUG
                if (Array.isArray(data)) {
                    setSedes(data);
                    setFilteredSedes(data);
                } else {
                    console.warn("Sedes data is not an array:", data); // DEBUG
                    setSedes([]);
                    setFilteredSedes([]);
                }
            })
            .catch(err => {
                console.error("Error en MapDashboard al cargar sedes:", err);
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

    const handleGenerateReport = async (options = {}) => {
        try {
            // Derived State for report
            const reportSedes = updatedSedesWithStatus();

            // Capture Map
            const mapElement = document.getElementById('map-capture');
            let mapImg = null;
            if (mapElement) {
                // Critical: Scroll to top to avoid offset bugs during capture
                window.scrollTo(0, 0);

                // Wait for rendering
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    console.log("Iniciando captura de mapa sanitizada con html2canvas...");

                    const canvas = await html2canvas(mapElement, {
                        useCORS: true,
                        allowTaint: false,
                        logging: false,
                        backgroundColor: '#ffffff',
                        scale: 2, // Use 2 for high density but keep positions relative
                        onclone: (clonedDoc) => {
                            // UNIVERSAL SANITIZATION: Replace all unsupported colors
                            const styles = clonedDoc.getElementsByTagName('style');
                            for (let s of styles) {
                                if (s.innerHTML.includes('oklch') || s.innerHTML.includes('oklab')) {
                                    s.disabled = true;
                                    s.remove();
                                }
                            }
                            const links = clonedDoc.getElementsByTagName('link');
                            for (let l of links) {
                                if (l.rel === 'stylesheet') {
                                    l.disabled = true;
                                    l.remove();
                                }
                            }
                            // Inline styles
                            clonedDoc.querySelectorAll('*').forEach(el => {
                                const s = el.getAttribute('style');
                                if (s && (s.includes('oklch') || s.includes('oklab'))) {
                                    el.setAttribute('style', s.replace(/oklch\([^)]+\)/g, '#3b82f6').replace(/oklab\([^)]+\)/g, '#3b82f6'));
                                }
                            });
                        },
                        ignoreElements: (node) => {
                            if (!node || !node.classList) return false;
                            return (
                                node.classList.contains('leaflet-control-container') ||
                                node.classList.contains('leaflet-draw-toolbar') ||
                                node.id === 'search-control' ||
                                (node.getAttribute && node.getAttribute('style')?.includes('zIndex: 1000'))
                            );
                        }
                    });

                    if (canvas) {
                        mapImg = canvas.toDataURL('image/png');
                        console.log("Captura de mapa exitosa");
                    }
                } catch (mapErr) {
                    console.error("Error capturando Mapa (html2canvas sanitized):", mapErr);
                }
            }

            // Capture Charts using html-to-image (better for modern CSS/oklch)
            let chartsImg = null;
            const chartsElement = document.getElementById('charts-capture-hidden');

            if (chartsElement) {
                try {
                    console.log("Esperando renderizado de gráficas (3.5s)...");
                    await new Promise(resolve => setTimeout(resolve, 3500));

                    console.log("Capturando gráficas con html-to-image...");
                    chartsImg = await toPng(chartsElement, {
                        backgroundColor: '#ffffff',
                        quality: 1,
                        pixelRatio: 2,
                        style: {
                            visibility: 'visible'
                        }
                    });
                    console.log("Captura de gráficas exitosa");
                } catch (chartErr) {
                    console.error("Error capturing Charts with html-to-image:", chartErr);
                }
            }

            // Ensure infrastructure data is available
            let reportInfrastructure = infrastructurePoints;

            // If manual layer is empty/off, and we have affected/nearby sedes, auto-fetch
            if ((!reportInfrastructure || reportInfrastructure.length === 0) && (affectedSedes.length > 0 || nearbySedes.length > 0)) {
                try {
                    const targetSedes = affectedSedes.length > 0 ? affectedSedes : nearbySedes;
                    const uniquePoints = new Map();

                    // Fetch for ALL target sedes (using Promise.all for speed)
                    const promises = targetSedes.map(sede =>
                        fetchInfrastructureNearPoint(sede.latitud, sede.longitud, 5) // 5km radius
                    );

                    const results = await Promise.all(promises);

                    results.flat().forEach(point => {
                        if (!uniquePoints.has(point.id)) {
                            uniquePoints.set(point.id, point);
                        }
                    });

                    reportInfrastructure = Array.from(uniquePoints.values());
                    console.log(`Auto-fetched ${reportInfrastructure.length} infrastructure points for report.`);

                } catch (infraErr) {
                    console.warn("Could not auto-fetch infrastructure for report:", infraErr);
                }
            }

            generatePDFReport(reportSedes, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg, reportInfrastructure, affectedColaboradores, options);
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
                nivel_alerta: eventDetails.nivel_alerta || 'verde',  // Usa el nivel elegido por el usuario
                geometria: JSON.stringify(zones),
                sedes_afectadas_ids: [...affectedSedes, ...nearbySedes].map(s => s.id)
            };

            await createEvento(eventoData);
            alert("Evento registrado exitosamente.");
            // Resetear solo descripción y nivel, mantener tipo
            setEventDetails(prev => ({ ...prev, description: '', nivel_alerta: 'verde' }));

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

    const handleLocate = (item) => {
        if (item && item.latitud && item.longitud) {
            setFocusLocation({
                coords: [item.latitud, item.longitud],
                zoom: 18 // Close zoom for specific item
            });
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

            {/* Banner de inactividad — aparece 2 minutos antes del logout automático */}
            {showIdleWarning && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                    background: '#f97316', color: 'white',
                    padding: '12px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'pulse 1s infinite'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        ⚠️ Tu sesión cerrará por inactividad en {Math.floor(idleCountdown / 60)}:{String(idleCountdown % 60).padStart(2, '0')} minutos
                    </span>
                    <button
                        onClick={() => { setShowIdleWarning(false); setIdleCountdown(120); }}
                        style={{
                            background: 'white', color: '#f97316', border: 'none',
                            padding: '6px 16px', borderRadius: '8px',
                            fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        Sigo aquí ✓
                    </button>
                </div>
            )}

            {/* Header */}

            <header className="dashboard-header" style={{ height: '64px', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'white', borderRadius: '50%', padding: '5px', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    </div>
                    <div>
                        <h1 className="header-title" style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>Sistema de Gestión Continuidad del Negocio</h1>
                        <span className="header-subtitle" style={{ fontSize: '0.75rem', opacity: 0.9 }}>Panel de Control</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="user-info" style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block' }}>Bienvenido, {user?.name}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user?.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {user?.role === 'admin' && (
                            <a href="/admin" style={{ textDecoration: 'none' }}>
                                <button style={{ background: '#1e40af', border: '1px solid #1e3a8a', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    🛠️ <span className="btn-text">Admin</span>
                                </button>
                            </a>
                        )}
                        <button onClick={logout} style={{ background: '#dc2626', border: '1px solid #b91c1c', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🚪 <span className="btn-text">Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            <style>{`
                @media (max-width: 768px) {
                    .dashboard-header {
                        padding: 0 10px !important;
                    }
                    .header-title {
                        font-size: 1rem !important;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 180px;
                    }
                    .header-subtitle {
                        display: none;
                    }
                    .user-info {
                        display: none !important;
                    }
                    .btn-text {
                        display: none;
                    }
                }
            `}</style>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar
                    onEventChange={() => { }}
                    affectedSedes={affectedSedes}
                    affectedColaboradores={affectedColaboradores} // Pass to Sidebar
                    nearbySedes={nearbySedes}
                    onSave={() => handleSaveEvent(eventDetails)}
                    onGenerateReport={handleGenerateReport}
                    onShowList={() => setShowList(true)}
                    onShowHistory={() => setShowHistory(true)}
                    onToggleCharts={() => setShowCharts(!showCharts)}
                    showCharts={showCharts}
                    onToggleMetrics={() => setShowMetricsPanel(!showMetricsPanel)}
                    showMetricsPanel={showMetricsPanel}
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
                    onToggleColaboradores={() => setShowColaboradores(!showColaboradores)}
                    showColaboradores={showColaboradores}
                    onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
                    showHeatmap={showHeatmap}
                    onSearchColaborador={setSearchTerm}
                    colaboradores={colaboradores} // Pass full list
                    sedes={sedes} // Pass full list
                    onLocate={handleLocate} // Fly to function
                />

                {/* Right Content Area (Scrollable) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
                    {/* News Feed Overlay (Fixed: Pass isOpen prop) */}
                    {showNews && (
                        <NewsFeed
                            isOpen={true}
                            onClose={() => setShowNews(false)}
                        />
                    )}

                    {/* Map Container (65% Height / Min 500px) */}
                    <div id="map-capture" style={{ height: '65vh', minHeight: '500px', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'relative' }}>
                        <MapComponent
                            sedes={filteredSedes}
                            onAnalysisUpdate={handleAnalysisUpdate}
                            focusLocation={focusLocation}
                        >
                            <EarthquakeLayer visible={showEarthquakes} onAlertsUpdate={setEarthquakeAlerts} />
                            {/* Debugging Weather Layer: visible={showWeather} sedes.length={sedes.length} */}
                            <WeatherLayer visible={showWeather} sedes={sedes} />
                            <InfrastructureLayer visible={showInfrastructure} onUpdate={setInfrastructurePoints} />
                            <ColaboradoresLayer visible={showColaboradores} colaboradores={colaboradores} />
                            {/* Indicador de carga mientras se descargan colaboradores */}
                            {loadingColaboradores && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'rgba(255,255,255,0.95)', padding: '16px 24px',
                                    borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                    zIndex: 9000, display: 'flex', alignItems: 'center', gap: '12px',
                                    fontSize: '0.95rem', color: '#334155', fontWeight: 500
                                }}>
                                    <span style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                    Cargando personal...
                                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                </div>
                            )}
                            <HeatmapLayer visible={showHeatmap} points={colaboradores} />
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


                    {/* Active Risk Zone Summary (Above Event Summary) */}
                    {(affectedSedes.length > 0 || nearbySedes.length > 0) && (
                        <div style={{ margin: '20px 20px 0 20px', background: '#ffe4e6', padding: '15px', borderRadius: '8px', border: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h5 style={{ margin: '0 0 5px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem' }}>
                                    🚨 Zona de Riesgo Activa
                                </h5>
                                <div style={{ fontSize: '0.95rem', color: '#7f1d1d', display: 'flex', gap: '20px' }}>
                                    <div>🏢 <strong>{affectedSedes.length}</strong> Sedes Afectadas</div>
                                    <div>👥 <strong>{affectedColaboradores.length}</strong> Empleados en Riesgo</div>
                                </div>
                            </div>
                            {affectedColaboradores.length > 0 && (
                                <button
                                    onClick={() => downloadColaboradoresCSV(affectedColaboradores)}
                                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    📊 Descargar Excel
                                </button>
                            )}
                        </div>
                    )}

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

                    {/* Charts & Details — Análisis de impacto del evento actual */}
                    {showCharts && sedesWithStatus && (
                        <div style={{ padding: '20px' }}>
                            <div id="charts-capture">
                                <DashboardCharts sedes={sedesWithStatus} />
                            </div>
                            <AffectedListTable affectedSedes={affectedSedes} nearbySedes={nearbySedes} />
                        </div>
                    )}

                    {/* Dashboard de Métricas Generales — siempre disponible */}
                    {showMetricsPanel && (
                        <div style={{ padding: '20px' }}>
                            <MetricsDashboard />
                        </div>
                    )}

                    {/* Ghost Charts for PDF Capture (Optimized style with FIXED HEIGHT & ABSOLUTE POS) */}
                    {sedesWithStatus && (
                        <div id="charts-capture-hidden" style={{
                            position: 'absolute',
                            top: '-5000px',
                            left: 0,
                            width: '1200px',
                            height: '800px',
                            zIndex: -1000,
                            background: 'white',
                            visibility: 'visible'
                        }}>
                            <DashboardCharts sedes={sedesWithStatus} pdfMode={true} />
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
