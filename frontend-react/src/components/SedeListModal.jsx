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
            <div style={{
                background: 'white',
                width: '900px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ background: '#2563eb', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>📋 Sedes y Procesos</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>&times;</button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    <input
                        type="text"
                        placeholder="Buscar sede..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />

                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                                    <th style={{ padding: '12px', width: '25%' }}>Sede / Ubicación</th>
                                    <th style={{ padding: '12px', width: '15%' }}>Estado</th>
                                    <th style={{ padding: '0', width: '60%' }}>
                                        <div style={{ display: 'flex', width: '100%' }}>
                                            <div style={{ padding: '12px', width: '40%', borderRight: '1px solid #e2e8f0' }}>Proceso</div>
                                            <div style={{ padding: '12px', width: '30%', borderRight: '1px solid #e2e8f0' }}>Criticidad</div>
                                            <div style={{ padding: '12px', width: '15%', borderRight: '1px solid #e2e8f0' }}>RTO</div>
                                            <div style={{ padding: '12px', width: '15%' }}>RPO</div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(sede => (
                                    <tr key={sede.id} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                                        <td style={{ padding: '12px', verticalAlign: 'top', borderRight: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{sede.nombre}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{sede.ciudad}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sede.direccion}</div>
                                        </td>
                                        <td style={{ padding: '12px', verticalAlign: 'top', borderRight: '1px solid #f1f5f9' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block',
                                                backgroundColor: sede.status === 'affected' ? '#fee2e2' : (sede.status === 'nearby' ? '#ffedd5' : '#dbeafe'),
                                                color: sede.status === 'affected' ? '#991b1b' : (sede.status === 'nearby' ? '#9a3412' : '#1e40af'),
                                                border: `1px solid ${sede.status === 'affected' ? '#ef4444' : (sede.status === 'nearby' ? '#f97316' : '#3b82f6')}`
                                            }}>
                                                {sede.status === 'affected' ? 'AFECTADA' : (sede.status === 'nearby' ? 'CERCANA' : 'OPERATIVA')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0', verticalAlign: 'top' }}>
                                            {sede.procesos && sede.procesos.length > 0 ? (
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        {sede.procesos.map((p, idx) => (
                                                            <tr key={p.id} style={{ borderBottom: idx < sede.procesos.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                                <td style={{ padding: '8px 12px', width: '40%' }}>{p.nombre}</td>
                                                                <td style={{ padding: '8px 12px', width: '30%' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span style={{
                                                                            width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.criticidad === 'Crítica' ? '#ef4444' : (p.criticidad === 'Alta' ? '#f97316' : (p.criticidad === 'Media' ? '#eab308' : '#3b82f6'))
                                                                        }}></span>
                                                                        {p.criticidad}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '8px 12px', width: '15%', fontSize: '0.85rem', color: '#64748b' }}>
                                                                    <strong>RTO:</strong> {p.rto}h
                                                                </td>
                                                                <td style={{ padding: '8px 12px', width: '15%', fontSize: '0.85rem', color: '#64748b' }}>
                                                                    <strong>RPO:</strong> {p.rpo || '-'}h
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
        </div>

    );
};

export default SedeListModal;
