import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadColaboradoresExcel, deleteColaboradores } from '../../services/colaboradoresService';
import { deleteEventos } from '../../services/eventoService';
import { downloadColaboradoresCSV } from '../../utils/exportUtils';

/**
 * DataTab — Gestión de datos: cargar personal, borrar, reportes y descarga.
 * Solo el admin ve las acciones destructivas.
 */
const DataTab = ({
    affectedSedes,
    nearbySedes,
    affectedColaboradores,
    onShowHistory,
    onSave,
    onGenerateReport,
}) => {
    const { user } = useAuth();
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
        } catch (error) {
            alert("❌ Error cargando archivo: " + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ margin: '0 0 10px', color: '#64748b' }}>Datos y Reportes</h4>

            {/* Input de archivo oculto */}
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

                {/* Acciones solo para Admin */}
                {user && user.role === 'admin' && (
                    <>
                        <button onClick={handleUploadClick} className="btn-layer" disabled={uploading}>
                            <span style={{ fontSize: '1.5rem' }}>{uploading ? '⏳' : '📤'}</span>
                            <span>{uploading ? 'Cargando...' : 'Cargar Personal'}</span>
                        </button>

                        <button
                            onClick={async () => {
                                if (confirm("⚠️ ¿Estás seguro de BORRAR TODA la base de datos de personal?\n\nEsta acción no se puede deshacer.")) {
                                    try {
                                        await deleteColaboradores();
                                        alert("✅ Personal eliminado correctamente.");
                                        window.location.reload();
                                    } catch {
                                        alert("Error eliminando personal.");
                                    }
                                }
                            }}
                            className="btn-layer"
                            style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fef2f2' }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>👥🗑️</span>
                            <span>Borrar Personal</span>
                        </button>

                        <button
                            onClick={async () => {
                                if (confirm("⚠️ ¿Estás seguro de BORRAR TODO el historial de eventos?\n\nEsto limpiará el mapa de marcas y polígonos.")) {
                                    try {
                                        await deleteEventos();
                                        alert("✅ Historial de eventos eliminado.");
                                        window.location.reload();
                                    } catch {
                                        alert("Error eliminando historial.");
                                    }
                                }
                            }}
                            className="btn-layer"
                            style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fef2f2' }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>📍🗑️</span>
                            <span>Borrar Historial</span>
                        </button>

                    </>
                )}
            </div>

            {/* Zona de reporte activa */}
            {(affectedSedes.length > 0 || nearbySedes.length > 0) && (
                <div style={{ padding: '15px', background: '#ffe4e6', borderRadius: '8px', border: '1px solid #fca5a5', marginTop: '10px' }}>
                    <h5 style={{ margin: '0 0 10px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem' }}>
                        🚨 Zona de Riesgo Activa
                    </h5>
                    <div style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#7f1d1d' }}>
                        <div style={{ marginBottom: '5px' }}>🏢 <strong>{affectedSedes.length}</strong> Sedes afectadas</div>
                        <div>👥 <strong>{affectedColaboradores.length}</strong> Colaboradores en zona afectada</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#991b1b', fontStyle: 'italic', marginBottom: '15px' }}>
                        * Estos datos serán incluidos automáticamente en el reporte.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            onClick={() => onSave()}
                            style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}
                        >
                            Guardar Evento
                        </button>
                        <button
                            onClick={() => onGenerateReport({ includeColaboradoresList: true })}
                            style={{ background: '#10b981', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
                        >
                            Generar Informe
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTab;
