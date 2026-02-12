import { useState, useEffect } from 'react';
import { createProceso, updateProceso, deleteProceso } from '../services/procesoService';

const ProcessManagementModal = ({ sede, onClose, onUpdate }) => {
    const [procesos, setProcesos] = useState([]);
    const [form, setForm] = useState({ nombre: '', criticidad: 'Normal', rto: 0, rpo: 0 });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (sede && sede.procesos) {
            setProcesos(sede.procesos);
        }
    }, [sede]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, sede: sede.id };

            if (editingId) {
                await updateProceso(editingId, payload);
                alert("Proceso actualizado");
            } else {
                await createProceso(payload);
                alert("Proceso creado");
            }
            // Reset and notify parent to reload data
            setForm({ nombre: '', criticidad: 'Normal', rto: 0, rpo: 0 });
            setEditingId(null);
            onUpdate();
        } catch (error) {
            console.error(error);
            alert("Error guardando proceso");
        }
    };

    const handleEdit = (proc) => {
        setForm({ nombre: proc.nombre, criticidad: proc.criticidad, rto: proc.rto, rpo: proc.rpo });
        setEditingId(proc.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar proceso?")) {
            await deleteProceso(id);
            onUpdate();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000
        }}>
            <div style={{
                background: 'white',
                width: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ background: '#2563eb', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>📋 Procesos de: {sede.nombre}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>&times;</button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    {/* List of Processes */}
                    <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                                    <th style={{ padding: '12px', width: '30%' }}>Proceso</th>
                                    <th style={{ padding: '12px', width: '20%' }}>Criticidad</th>
                                    <th style={{ padding: '12px', width: '15%' }}>RTO (h)</th>
                                    <th style={{ padding: '12px', width: '15%' }}>RPO (h)</th>
                                    <th style={{ padding: '12px', width: '20%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sede.procesos && sede.procesos.length > 0 ? (
                                    sede.procesos.map((p, idx) => (
                                        <tr key={p.id} style={{ borderBottom: idx < sede.procesos.length - 1 ? '1px solid #e2e8f0' : 'none', background: 'white' }}>
                                            <td style={{ padding: '12px', fontWeight: '500', color: '#0f172a' }}>{p.nombre}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block',
                                                    backgroundColor: p.criticidad === 'Crítica' ? '#fee2e2' : (p.criticidad === 'Alta' ? '#ffedd5' : (p.criticidad === 'Media' ? '#fef9c3' : '#dbeafe')),
                                                    color: p.criticidad === 'Crítica' ? '#991b1b' : (p.criticidad === 'Alta' ? '#9a3412' : (p.criticidad === 'Media' ? '#854d0e' : '#1e40af')),
                                                    border: `1px solid ${p.criticidad === 'Crítica' ? '#ef4444' : (p.criticidad === 'Alta' ? '#f97316' : (p.criticidad === 'Media' ? '#eab308' : '#3b82f6'))}`
                                                }}>
                                                    {p.criticidad}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#64748b' }}><strong>{p.rto}</strong></td>
                                            <td style={{ padding: '12px', color: '#64748b' }}><strong>{p.rpo}</strong></td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => handleEdit(p)} style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Editar">✏️</button>
                                                <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }}>No hay procesos registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Form */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>{editingId ? '✏️ Editar Proceso' : '➕ Agregar Nuevo Proceso'}</h4>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Nombre del Proceso</label>
                                <input
                                    placeholder="Ej. Nómina, Facturación..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Criticidad</label>
                                <select
                                    value={form.criticidad}
                                    onChange={e => setForm({ ...form, criticidad: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Crítica">Crítica</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>RTO (Horas)</label>
                                    <input type="number" value={form.rto} onChange={e => setForm({ ...form, rto: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>RPO (Horas)</label>
                                    <input type="number" value={form.rpo} onChange={e => setForm({ ...form, rpo: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    gridColumn: 'span 2',
                                    padding: '12px',
                                    marginTop: '10px',
                                    background: editingId ? '#f59e0b' : '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {editingId ? 'Actualizar Proceso' : 'Agregar Proceso'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessManagementModal;
