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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[2000] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="img-header p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        📜 Historial de Eventos
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
                            <span className="loading loading-spinner loading-lg"></span>
                            Cargando historial...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Fecha</th>
                                        <th className="px-6 py-4 font-semibold">Tipo</th>
                                        <th className="px-6 py-4 font-semibold">Nivel</th>
                                        <th className="w-1/3 px-6 py-4 font-semibold">Descripción</th>
                                        <th className="px-6 py-4 font-semibold text-center">Sedes</th>
                                        <th className="px-6 py-4 font-semibold text-center">Reporte</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {eventos.map(ev => (
                                        <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                {new Date(ev.fecha).toLocaleDateString()}
                                                <span className="block text-xs text-slate-400 mt-0.5">
                                                    {new Date(ev.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${ev.tipo === 'Sismo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        ev.tipo === 'Incendio' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            ev.tipo === 'Inundación' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {ev.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${ev.nivel_alerta === 'rojo' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' :
                                                        ev.nivel_alerta === 'naranja' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' :
                                                            ev.nivel_alerta === 'amarillo' ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10' :
                                                                'bg-green-50 text-green-700 ring-1 ring-green-600/10'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ev.nivel_alerta === 'rojo' ? 'bg-red-600' :
                                                            ev.nivel_alerta === 'naranja' ? 'bg-orange-500' :
                                                                ev.nivel_alerta === 'amarillo' ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}></span>
                                                    {ev.nivel_alerta ? ev.nivel_alerta.charAt(0).toUpperCase() + ev.nivel_alerta.slice(1) : 'Verde'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 line-clamp-2" title={ev.descripcion}>
                                                {ev.descripcion || <span className="italic text-slate-400">Sin descripción</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center min-w-[30px] h-[24px] px-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">
                                                    {ev.sedes_afectadas?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDownloadReport(ev)}
                                                    className="group text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {eventos.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="text-4xl">📭</span>
                                                    <p>No hay eventos registrados en el historial.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventHistoryModal;
