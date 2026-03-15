import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import Sidebar from '../components/Sidebar';
import DashboardCharts from '../components/DashboardCharts';
import MetricsDashboard from '../components/MetricsDashboard';
import EventHistoryModal from '../components/EventHistoryModal';
import SedeListModal from '../components/SedeListModal';
import AffectedListTable from '../components/AffectedListTable';
import InstructionsModal from '../components/InstructionsModal';
import EventRegistrationPanel from '../components/EventRegistrationPanel';
import InfrastructureLayer from '../components/InfrastructureLayer';
import ColaboradoresLayer from '../components/ColaboradoresLayer';
import HeatmapLayer from '../components/HeatmapLayer';
import WeatherLayer from '../components/WeatherLayer';
import EarthquakeLayer from '../components/EarthquakeLayer';
import NewsFeed from '../components/NewsFeed';

// Componentes y Hooks refactorizados
import DashboardHeader from '../components/DashboardHeader';
import RiskAlertBanner from '../components/RiskAlertBanner';
import SideDrawer from '../components/SideDrawer';
import GlassCard from '../components/GlassCard';
import useMapLayers from '../hooks/useMapLayers';
import useAnalysis from '../hooks/useAnalysis';
import useReporting from '../hooks/useReporting';

import { getSedes } from '../services/sedeService';
import { createEvento } from '../services/eventoService';
import { fetchColaboradores } from '../services/colaboradoresService';
import useIdleTimer from '../hooks/useIdleTimer';

const MapDashboard = () => {
    const { user, logout } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loadingColaboradores, setLoadingColaboradores] = useState(false);
    
    // Hooks de Lógica Extraída
    const layers = useMapLayers();
    const analysis = useAnalysis(sedes, colaboradores);
    
    // Estado de Eventos (Se mantiene aquí por ser el dueño del formulario)
    const [eventDetails, setEventDetails] = useState({
        description: '',
        type: 'Servicios Públicos',
        nivel_alerta: 'verde',
    });

    const reporting = useReporting(user, analysis.affectedSedes, analysis.nearbySedes, analysis.affectedColaboradores, eventDetails, []);

    // Timer de inactividad
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    const [idleCountdown, setIdleCountdown] = useState(120);

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

    useEffect(() => {
        if (!showIdleWarning) return;
        if (idleCountdown <= 0) { logout(); return; }
        const t = setTimeout(() => setIdleCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [showIdleWarning, idleCountdown, logout]);

    const [showCharts, setShowCharts] = useState(false);
    const [showMetricsPanel, setShowMetricsPanel] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    
    const [infrastructurePoints, setInfrastructurePoints] = useState([]);
    const [earthquakeAlerts, setEarthquakeAlerts] = useState([]);
    const [emergencyAlert, setEmergencyAlert] = useState(null);
    const [focusLocation, setFocusLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Carga de inicial de Sedes
    useEffect(() => {
        getSedes()
            .then(data => {
                if (Array.isArray(data)) {
                    setSedes(data);
                    setFilteredSedes(data);
                }
            })
            .catch(err => console.error("Error cargando sedes:", err));
    }, []);

    // Lazy loading de Colaboradores
    useEffect(() => {
        if ((layers.showColaboradores || layers.showHeatmap) && colaboradores.length === 0) {
            setLoadingColaboradores(true);
            fetchColaboradores()
                .then(data => setColaboradores(data))
                .catch(err => console.error("Error loading colaboradores:", err))
                .finally(() => setLoadingColaboradores(false));
        }
    }, [layers.showColaboradores, layers.showHeatmap, colaboradores.length]);

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

    const handleAnalysisUpdate = analysis.handleAnalysisUpdate;

    const handleSaveEvent = async () => {
        if (!eventDetails.description) {
            alert("Por favor ingrese una descripción del evento.");
            return;
        }
        try {
            const eventoData = {
                tipo: eventDetails.type,
                descripcion: eventDetails.description,
                nivel_alerta: eventDetails.nivel_alerta || 'verde',
                geometria: JSON.stringify(analysis.zones),
                sedes_afectadas_ids: [...analysis.affectedSedes, ...analysis.nearbySedes].map(s => s.id)
            };
            await createEvento(eventoData);
            alert("Evento registrado exitosamente.");
            setEventDetails(prev => ({ ...prev, description: '', nivel_alerta: 'verde' }));
        } catch (error) {
            alert("Error guardando evento.");
            console.error(error);
        }
    };

    const sedesWithStatus = filteredSedes.map(s => {
        const isAffected = analysis.affectedSedes.some(a => a.id === s.id);
        const isNearby = analysis.nearbySedes.some(n => n.id === s.id);
        return { ...s, status: isAffected ? 'affected' : (isNearby ? 'nearby' : 'normal') };
    });

    const handleLocate = (item) => {
        if (item?.latitud && item?.longitud) {
            setFocusLocation({ coords: [item.latitud, item.longitud], zoom: 18 });
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden">
            {/* Banner de inactividad */}
            {showIdleWarning && (
                <div className="fixed top-0 left-0 right-0 z-[10000] bg-crisis text-white p-3 flex justify-between items-center shadow-2xl animate-pulse">
                    <span className="font-bold flex items-center gap-2">⚠️ <span className="hidden sm:inline">Tu sesión cerrará pronto:</span> {Math.floor(idleCountdown / 60)}:{String(idleCountdown % 60).padStart(2, '0')}</span>
                    <button onClick={() => { setShowIdleWarning(false); setIdleCountdown(120); }} className="bg-white text-crisis px-6 py-1.5 rounded-xl font-black text-xs uppercase tracking-tighter">Seguir Trabajando</button>
                </div>
            )}

            <DashboardHeader user={user} logout={logout} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar Glass */}
                <Sidebar
                    className="glass-panel border-none"
                    affectedSedes={analysis.affectedSedes}
                    affectedColaboradores={analysis.affectedColaboradores}
                    nearbySedes={analysis.nearbySedes}
                    onSave={handleSaveEvent}
                    onGenerateReport={() => reporting.handleGenerateReport({}, sedesWithStatus)}
                    onShowList={() => setShowList(true)}
                    onShowHistory={() => setShowHistory(true)}
                    onToggleCharts={() => setShowCharts(!showCharts)}
                    showCharts={showCharts}
                    onToggleMetrics={() => setShowMetricsPanel(!showMetricsPanel)}
                    showMetricsPanel={showMetricsPanel}
                    
                    onToggleEarthquakes={layers.toggleEarthquakes}
                    showEarthquakes={layers.showEarthquakes}
                    onToggleWeather={layers.toggleWeather}
                    showWeather={layers.showWeather}
                    onToggleTraffic={layers.toggleTraffic}
                    showTraffic={layers.showTraffic}
                    onToggleInfrastructure={layers.toggleInfrastructure}
                    showInfrastructure={layers.showInfrastructure}
                    onToggleColaboradores={layers.toggleColaboradores}
                    showColaboradores={layers.showColaboradores}
                    onToggleHeatmap={layers.toggleHeatmap}
                    showHeatmap={layers.showHeatmap}
                    onToggleNews={layers.toggleNews}
                    showNews={layers.showNews}

                    onSimulateAlert={() => setEmergencyAlert({ mag: 6.2, place: "SIMULACRO: Mesa de los Santos", coordinates: [-73.12, 6.79] })}
                    onShowHelp={() => setShowHelp(true)}
                    onSearchColaborador={setSearchTerm}
                    colaboradores={colaboradores}
                    sedes={sedes}
                    earthquakeAlerts={earthquakeAlerts}
                    onLocate={handleLocate}
                />

                <main className="flex-1 overflow-y-auto relative bg-slate-50 custom-scrollbar">
                    {layers.showNews && <NewsFeed isOpen={true} onClose={layers.toggleNews} />}

                    <div id="map-capture" className="h-[65vh] min-h-[500px] relative shadow-2xl overflow-hidden border-b border-white/5">
                        <MapComponent sedes={filteredSedes} onAnalysisUpdate={handleAnalysisUpdate} focusLocation={focusLocation}>
                            <EarthquakeLayer visible={layers.showEarthquakes} onAlertsUpdate={setEarthquakeAlerts} />
                            <WeatherLayer visible={layers.showWeather} sedes={sedes} />
                            <InfrastructureLayer visible={layers.showInfrastructure} onUpdate={setInfrastructurePoints} />
                            <ColaboradoresLayer visible={layers.showColaboradores} colaboradores={colaboradores} />
                            <HeatmapLayer visible={layers.showHeatmap} points={colaboradores} />
                        </MapComponent>

                        {loadingColaboradores && (
                            <div className="absolute inset-0 z-[5000] bg-slate-950/30 backdrop-blur-[4px] flex items-center justify-center">
                                <div className="glass-panel p-6 rounded-3xl shadow-2xl flex items-center gap-4 font-black text-white tracking-wider">
                                    <span className="animate-spin text-3xl">⏳</span> CARGANDO PERSONAL...
                                </div>
                            </div>
                        )}

                        {layers.showTraffic && (
                            <div className="absolute inset-0 z-[2000] bg-slate-900 flex flex-col animate-in fade-in duration-500">
                                <button 
                                    onClick={layers.toggleTraffic} 
                                    className="absolute top-4 right-4 z-[2001] w-8 h-8 flex items-center justify-center bg-white/90 text-slate-900 rounded-full shadow-lg hover:bg-white transition-colors font-bold text-xl border border-slate-200"
                                    title="Cerrar Mapa de Tráfico"
                                >
                                    &times;
                                </button>
                                <iframe 
                                    src="https://embed.waze.com/iframe?zoom=12&lat=4.711&lon=-74.072&ct=livemap" 
                                    className="flex-1 border-none w-full h-full" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>

                    <RiskAlertBanner 
                        affectedSedes={analysis.affectedSedes} 
                        nearbySedes={analysis.nearbySedes} 
                        affectedColaboradores={analysis.affectedColaboradores} 
                    />

                    <div className="p-8">
                        {/* Event Registration (Could also be a Drawer, but keeping here for context) */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
                             <EventRegistrationPanel 
                                eventDetails={eventDetails} 
                                onChange={(e) => setEventDetails(prev => ({...prev, [e.target.name]: e.target.value}))} 
                                onSave={handleSaveEvent} 
                            />
                        </div>

                        {showCharts && (
                            <div className="animate-in fade-in slide-in-from-bottom duration-1000">
                                <GlassCard title="Análisis de Impacto Georeferenciado" icon="📊" className="mb-8" light={true}>
                                    <div id="charts-capture"><DashboardCharts sedes={sedesWithStatus} /></div>
                                </GlassCard>
                                <GlassCard title="Sedes en Punto de Control" icon="🏢" light={true}>
                                    <AffectedListTable affectedSedes={analysis.affectedSedes} nearbySedes={analysis.nearbySedes} />
                                </GlassCard>
                            </div>
                        )}

                        {showMetricsPanel && (
                            <div className="animate-in zoom-in duration-500">
                                <GlassCard title="Métricas de Continuidad de Negocio" icon="📈" light={true}>
                                    <MetricsDashboard />
                                </GlassCard>
                            </div>
                        )}
                    </div>

                    {/* Captura Fantasma para PDF */}
                    <div id="charts-capture-hidden" className="absolute -top-[10000px] left-0 w-[1200px] h-[800px] z-[-1000] bg-white text-slate-900">
                        <DashboardCharts sedes={sedesWithStatus} pdfMode={true} />
                    </div>
                </main>
            </div>

            {/* Side Drawers (Replaces Modals) */}
            <SideDrawer 
                isOpen={showHistory} 
                onClose={() => setShowHistory(false)} 
                title="Historial de Eventos" 
                width="w-[500px]"
            >
                <EventHistoryModal isInsideDrawer onClose={() => setShowHistory(false)} />
            </SideDrawer>

            {showList && (
                <SedeListModal sedes={sedesWithStatus} onClose={() => setShowList(false)} />
            )}

            {showHelp && <InstructionsModal onClose={() => setShowHelp(false)} />}

            {/* Alerta de Emergencia Crítica */}
            {emergencyAlert && (
                <div className="fixed bottom-10 right-10 glass-panel border-l-8 border-crisis p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(239,68,68,0.5)] z-[10000] max-w-sm animate-in zoom-in slide-in-from-right duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-crisis/10 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="flex justify-between items-start mb-6 relative">
                        <h2 className="text-crisis font-black text-2xl tracking-tighter flex items-center gap-3">🚨 SISMO DETECTADO</h2>
                        <button onClick={() => setEmergencyAlert(null)} className="text-4xl leading-none text-white/30 hover:text-white">×</button>
                    </div>
                    <div className="bg-crisis/20 p-5 rounded-2xl mb-6 border border-crisis/30 relative">
                        <p className="font-black text-white text-3xl mb-1 tracking-tight">Mag {emergencyAlert.mag}</p>
                        <p className="text-crisis-200 text-sm font-medium uppercase tracking-widest">{emergencyAlert.place}</p>
                    </div>
                    <button onClick={() => { layers.setShowEarthquakes(true); setFocusLocation({ coords: [emergencyAlert.coordinates[1], emergencyAlert.coordinates[0]], timestamp: Date.now() }); setEmergencyAlert(null); }} className="w-full bg-crisis hover:bg-red-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-crisis/40 transition-all hover:-translate-y-1 active:scale-95">Evaluar Afectación</button>
                </div>
            )}
        </div>
    );
};

export default MapDashboard;
