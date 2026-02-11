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
            <div className="card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'cursor' }}
                >
                    &times;
                </button>

                <h2 className="mb-4">Procesos de: {sede.nombre}</h2>

                {/* List of Processes */}
                <div style={{ marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Proceso</th>
                                <th style={{ padding: '8px' }}>Criticidad</th>
                                <th style={{ padding: '8px' }}>RTO (h)</th>
                                <th style={{ padding: '8px' }}>RPO (h)</th>
                                <th style={{ padding: '8px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sede.procesos && sede.procesos.length > 0 ? (
                                sede.procesos.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '8px' }}>{p.nombre}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: 'white',
                                                backgroundColor: p.criticidad === 'Crítica' ? '#ef4444' : (p.criticidad === 'Alta' ? '#f97316' : '#3b82f6')
                                            }}>
                                                {p.criticidad}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>{p.rto}</td>
                                        <td style={{ padding: '8px' }}>{p.rpo}</td>
                                        <td style={{ padding: '8px' }}>
                                            <button onClick={() => handleEdit(p)} style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                                            <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No hay procesos registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Form */}
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                    <h4>{editingId ? 'Editar Proceso' : 'Agregar Proceso'}</h4>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                        <input
                            placeholder="Nombre del Proceso"
                            style={{ gridColumn: 'span 2', padding: '8px' }}
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            required
                        />

                        <select
                            value={form.criticidad}
                            onChange={e => setForm({ ...form, criticidad: e.target.value })}
                            style={{ padding: '8px' }}
                        >
                            <option value="Normal">Normal</option>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                            <option value="Crítica">Crítica</option>
                        </select>

                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <label>RTO:</label>
                            <input type="number" value={form.rto} onChange={e => setForm({ ...form, rto: e.target.value })} style={{ width: '80px', padding: '5px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <label>RPO:</label>
                            <input type="number" value={form.rpo} onChange={e => setForm({ ...form, rpo: e.target.value })} style={{ width: '80px', padding: '5px' }} />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ gridColumn: 'span 2', marginTop: '10px' }}
                        >
                            {editingId ? 'Actualizar Proceso' : 'Agregar Proceso'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProcessManagementModal;
