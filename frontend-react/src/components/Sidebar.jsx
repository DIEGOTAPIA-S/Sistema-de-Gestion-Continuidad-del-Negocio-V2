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
    showCharts
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
                    📋 S. Totales
                </button>
                <button onClick={onShowHistory} className="btn-sidebar">
                    📜 Historial
                </button>
                <button onClick={onToggleCharts} className={`btn-sidebar ${showCharts ? 'active' : ''}`}>
                    📊 {showCharts ? 'Ocultar' : 'Métricas'}
                </button>
                <button onClick={onGenerateReport} className="btn-sidebar btn-green" disabled={affectedSedes.length === 0}>
                    📥 PDF
                </button>
                <button onClick={onSave} className="btn-sidebar btn-dark" style={{ gridColumn: '1 / -1' }}>
                    💾 Guardar Evento
                </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#64748b' }}>📝 Detalles del Evento</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Tipo de Evento</label>
                    <select
                        name="type"
                        value={eventDetails.type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                        <option value="Sismo">Sismo</option>
                        <option value="Inundación">Inundación</option>
                        <option value="Incendio">Incendio</option>
                        <option value="Protesta">Protesta Social</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Descripción</label>
                    <textarea
                        name="description"
                        value={eventDetails.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describa el evento..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    />
                </div>

                <div style={{ marginTop: 'auto', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        Use los controles de dibujo en el mapa para seleccionar las zonas afectadas.
                    </p>
                </div>
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
