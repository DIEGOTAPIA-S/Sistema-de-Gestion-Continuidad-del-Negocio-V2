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

const MapDashboard = () => {
    const { user, logout } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);

    // Analysis State
    const [zones, setZones] = useState([]);
    const [affectedSedes, setAffectedSedes] = useState([]);
    const [nearbySedes, setNearbySedes] = useState([]);
    const [eventDetails, setEventDetails] = useState({ description: '', type: 'Sismo' });

    const [showCharts, setShowCharts] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showList, setShowList] = useState(false);

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

    const handleEventChange = (details) => {
        setEventDetails(details);
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

            generatePDFReport(reportSedes, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg);
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
                        <span style={{ fontSize: '1.2rem' }}>🏥</span>
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
                    {user?.role === 'admin' && <button onClick={() => window.location.href = '/admin'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.2rem' }}>⚙️</button>}
                    <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.2rem' }}>🚪</button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <Sidebar
                    onEventChange={handleEventChange}
                    affectedSedes={affectedSedes}
                    nearbySedes={nearbySedes}
                    onSave={handleSaveEvent}
                    onGenerateReport={handleGenerateReport}
                    onShowList={() => setShowList(true)}
                    onShowHistory={() => setShowHistory(true)}
                    onToggleCharts={() => setShowCharts(!showCharts)}
                    showCharts={showCharts}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', padding: '20px', gap: '20px' }}>

                    {/* Search & Filter */}
                    <div style={{ zIndex: 10 }}>
                        <FilterControl onFilter={handleFilter} />
                    </div>

                    {/* Map */}
                    <div id="map-capture" style={{ height: '500px', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <MapComponent
                            sedes={filteredSedes}
                            onAnalysisUpdate={handleAnalysisUpdate}
                        />
                    </div>

                    {/* Event Summary Box (Above Charts) */}
                    {(affectedSedes.length > 0 || nearbySedes.length > 0) && (
                        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                        <>
                            <div id="charts-capture">
                                <DashboardCharts sedes={sedesWithStatus} />
                            </div>
                            <AffectedListTable affectedSedes={affectedSedes} nearbySedes={nearbySedes} />
                        </>
                    )}
                </div>
            </div>

            {showHistory && <EventHistoryModal onClose={() => setShowHistory(false)} />}
            {showList && <SedeListModal sedes={sedesWithStatus} onClose={() => setShowList(false)} />}
        </div>
    );
};

export default MapDashboard;
