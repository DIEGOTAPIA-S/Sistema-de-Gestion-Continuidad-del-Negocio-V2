import { useState } from 'react';

const SedeListModal = ({ sedes, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = sedes.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000
        }}>
            <div className="card" style={{ width: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="mb-0">📋 Inventario de Sedes y Procesos</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar sede..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px' }}>Sede</th>
                                <th style={{ padding: '12px' }}>Ubicación</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px' }}>Proceso</th>
                                <th style={{ padding: '12px' }}>Criticidad</th>
                                <th style={{ padding: '12px' }}>RTO</th>
                                <th style={{ padding: '12px' }}>RPO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(sede => (
                                <tr key={sede.id} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                                    <td style={{ padding: '12px', verticalAlign: 'top', fontWeight: 'bold', color: '#1e293b' }}>
                                        {sede.nombre}
                                    </td>
                                    <td style={{ padding: '12px', verticalAlign: 'top', color: '#64748b' }}>
                                        {sede.ciudad}<br /><small>{sede.direccion}</small>
                                    </td>
                                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            backgroundColor: sede.status === 'affected' ? '#fee2e2' : (sede.status === 'nearby' ? '#ffedd5' : '#dbeafe'),
                                            color: sede.status === 'affected' ? '#991b1b' : (sede.status === 'nearby' ? '#9a3412' : '#1e40af'),
                                            border: `1px solid ${sede.status === 'affected' ? '#ef4444' : (sede.status === 'nearby' ? '#f97316' : '#3b82f6')}`
                                        }}>
                                            {sede.status === 'affected' ? 'AFECTADA' : (sede.status === 'nearby' ? 'CERCANA' : 'OPERATIVA')}
                                        </span>
                                    </td>
                                    <td colSpan="4" style={{ padding: '0', verticalAlign: 'top' }}>
                                        {sede.procesos && sede.procesos.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {sede.procesos.map((p, idx) => (
                                                        <tr key={p.id} style={{ borderBottom: idx < sede.procesos.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                            <td style={{ padding: '8px 12px', width: '30%' }}>{p.nombre}</td>
                                                            <td style={{ padding: '8px 12px', width: '30%' }}>
                                                                <span style={{
                                                                    width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '6px',
                                                                    backgroundColor: p.criticidad === 'Crítica' ? '#ef4444' : (p.criticidad === 'Alta' ? '#f97316' : (p.criticidad === 'Media' ? '#eab308' : '#3b82f6'))
                                                                }}></span>
                                                                {p.criticidad}
                                                            </td>
                                                            <td style={{ padding: '8px 12px', width: '20%', fontSize: '0.9em' }}>
                                                                <strong>{p.rto}h</strong>
                                                            </td>
                                                            <td style={{ padding: '8px 12px', width: '20%', fontSize: '0.9em' }}>
                                                                <strong>{p.rpo || '-'}h</strong>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ padding: '12px', fontStyle: 'italic', color: '#94a3b8' }}>Sin procesos registrados</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SedeListModal;
