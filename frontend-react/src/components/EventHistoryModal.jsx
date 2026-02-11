import { useState, useEffect } from 'react';
import { getEventos } from '../services/eventoService';
import { generatePDFReport } from '../utils/reportGenerator';
import { useAuth } from '../context/AuthContext';

const EventHistoryModal = ({ onClose }) => {
    const { user } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        try {
            const data = await getEventos();
            setEventos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = (evento) => {
        // Reconstruct data for report generator
        // affectedSedes are in event.sedes_afectadas
        // We might not have 'nearbySedes' stored explicitly unless we add it to backend.
        // For now, we'll treat all associated sedes as affected for the historic report.

        // Ensure sedes have processes to avoid crashes:
        const cleanSedes = (evento.sedes_afectadas || []).map(s => ({
            ...s,
            procesos: s.procesos || []
        }));

        generatePDFReport(
            cleanSedes, // All Sedes context
            cleanSedes, // Affected
            [],         // Nearby (Not available in history yet)
            { type: evento.tipo, description: evento.descripcion },
            { name: evento.creado_por } // Creator from event history
        );
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000
        }}>
            <div className="card" style={{ width: '800px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'cursor' }}
                >
                    &times;
                </button>

                <h2 className="mb-4">📜 Historial de Eventos</h2>

                {loading ? <p>Cargando...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Fecha</th>
                                <th style={{ padding: '10px' }}>Tipo</th>
                                <th style={{ padding: '10px' }}>Descripción</th>
                                <th style={{ padding: '10px' }}>Afectadas</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.map(ev => (
                                <tr key={ev.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px' }}>{new Date(ev.fecha).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                            background: ev.nivel_alerta === 'rojo' ? '#fee2e2' : '#dbeafe',
                                            color: ev.nivel_alerta === 'rojo' ? '#991b1b' : '#1e40af'
                                        }}>
                                            {ev.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', maxWidth: '300px' }}>{ev.descripcion}</td>
                                    <td style={{ padding: '10px' }}>{ev.sedes_afectadas?.length || 0}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleDownloadReport(ev)}
                                            className="btn btn-ghost"
                                            title="Descargar PDF"
                                        >
                                            📥
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EventHistoryModal;
