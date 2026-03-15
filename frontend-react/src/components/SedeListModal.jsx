import { useState } from 'react';

/**
 * SedeListModal — Versión de Tabla Columnar.
 * Formato de tabla estricto para Procesos Críticos con columnas alineadas.
 */
const SedeListModal = ({ sedes, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = sedes.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }} className="modal-content">
                
                {/* Header — Estilo Corporativo */}
                <div style={{ 
                    background: '#0f172a', 
                    padding: '1.25rem 1.75rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📖</span>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                            Directorio de Sedes y Procesos Críticos
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>&times;</button>
                </div>

                {/* Buscador */}
                <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar sede o ciudad..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', 
                                border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                    </div>
                </div>

                {/* Tabla Principal */}
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead style={{ position: 'sticky', top: 0, zMount: 10, background: '#f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontSize: '0.75rem', fontWeight: '800', width: '25%' }}>SEDE / UBICACIÓN</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: '800', width: '10%' }}>ESTADO</th>
                                <th style={{ padding: '0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', fontWeight: '800', width: '65%' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr', padding: '1rem' }}>
                                        <span>PROCESO CRÍTICO</span>
                                        <span style={{ textAlign: 'center' }}>CRITICIDAD</span>
                                        <span style={{ textAlign: 'center' }}>RTO</span>
                                        <span style={{ textAlign: 'center' }}>MTPD</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(sede => (
                                <tr key={sede.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{sede.nombre}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{sede.ciudad} — {sede.direccion}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                            backgroundColor: sede.status === 'affected' ? '#fee2e2' : (sede.status === 'nearby' ? '#ffedd5' : '#f0fdf4'),
                                            color: sede.status === 'affected' ? '#b91c1c' : (sede.status === 'nearby' ? '#9a3412' : '#166534'),
                                            border: `1px solid ${sede.status === 'affected' ? '#fecaca' : (sede.status === 'nearby' ? '#fed7aa' : '#bbf7d0')}`
                                        }}>
                                            {sede.status === 'affected' ? 'AFECTADA' : (sede.status === 'nearby' ? 'RIESGO' : 'OPERATIVA')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0', verticalAlign: 'top' }}>
                                        {sede.procesos && sede.procesos.length > 0 ? (
                                            <div>
                                                {sede.procesos.map((p, idx) => (
                                                    <div key={p.id} style={{ 
                                                        display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr', 
                                                        padding: '0.8rem 1rem', borderBottom: idx < sede.procesos.length - 1 ? '1px solid #f8fafc' : 'none',
                                                        fontSize: '0.85rem', alignItems: 'center'
                                                    }}>
                                                        <div style={{ fontWeight: '600', color: '#334155' }}>{p.nombre}</div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <span style={{ 
                                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800',
                                                                background: p.criticidad === 'Crítica' ? '#dc2626' : (p.criticidad === 'Alta' ? '#ea580c' : (p.criticidad === 'Media' ? '#64748b' : '#94a3b8')),
                                                                color: 'white'
                                                            }}>{p.criticidad}</span>
                                                        </div>
                                                        <div style={{ textAlign: 'center', color: '#64748b' }}>{p.rto}h</div>
                                                        <div style={{ textAlign: 'center', color: '#64748b' }}>{p.mtpd || p.rpo || '-'}h</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '1rem', color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin procesos registrados</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <div>Total sedes encontradas: <strong>{filtered.length}</strong></div>
                    <div>SGCN v2.1 — Gestión de Continuidad</div>
                </div>
            </div>
        </div>
    );
};

export default SedeListModal;
