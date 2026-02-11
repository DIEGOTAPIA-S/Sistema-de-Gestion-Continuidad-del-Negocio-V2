import React from 'react';

const AffectedListTable = ({ affectedSedes = [], nearbySedes = [] }) => {
    // Combine lists with status flags
    const allSedes = [
        ...(affectedSedes || []).map(s => ({ ...s, _status: 'Afectada', _bgColor: '#fee2e2', _textColor: '#991b1b', _borderColor: '#fecaca' })),
        ...(nearbySedes || []).map(s => ({ ...s, _status: 'Cercana', _bgColor: '#fef3c7', _textColor: '#92400e', _borderColor: '#fde68a' }))
    ];

    if (allSedes.length === 0) {
        return null;
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            marginTop: '20px',
            marginBottom: '40px' // Add bottom margin for scrolling
        }}>
            <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '1.2rem',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '10px'
            }}>
                📋 Detalle de Sedes Impactadas
            </h3>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Sede / Ubicación</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Procesos Críticos</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Criticidad</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>RTO</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>RPO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allSedes.map((sede) => (
                            <React.Fragment key={sede.id}>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            background: sede._bgColor,
                                            color: sede._textColor,
                                            border: `1px solid ${sede._borderColor}`,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {sede._status.toUpperCase()}
                                        </span>
                                    </td>

                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{sede.nombre}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>{sede.ciudad}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{sede.direccion}</div>
                                    </td>

                                    {/* Merged Process Columns for better vertical alignment */}
                                    <td colSpan="4" style={{ padding: '0', verticalAlign: 'top' }}>
                                        {sede.procesos && sede.procesos.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {sede.procesos.map((p, idx) => (
                                                        <tr key={idx} style={{ borderBottom: idx < sede.procesos.length - 1 ? '1px dotted #e2e8f0' : 'none' }}>
                                                            <td style={{ padding: '10px 16px', width: '40%', color: '#334155' }}>{p.nombre}</td>

                                                            <td style={{ padding: '10px 16px', textAlign: 'center', width: '20%' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '2px 8px',
                                                                    fontSize: '0.75rem',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '500',
                                                                    background: p.criticidad === 'Crítica' ? '#ef4444' : (p.criticidad === 'Alta' ? '#f97316' : '#f1f5f9'),
                                                                    color: p.criticidad === 'Crítica' || p.criticidad === 'Alta' ? 'white' : '#475569'
                                                                }}>
                                                                    {p.criticidad}
                                                                </span>
                                                            </td>

                                                            <td style={{ padding: '10px 16px', textAlign: 'center', width: '20%', fontWeight: '500', color: '#0f172a' }}>
                                                                {p.rto}h
                                                            </td>
                                                            <td style={{ padding: '10px 16px', textAlign: 'center', width: '20%', fontWeight: '500', color: '#0f172a' }}>
                                                                {p.rpo || '-'}h
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ padding: '16px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                Sin procesos registrados
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AffectedListTable;
