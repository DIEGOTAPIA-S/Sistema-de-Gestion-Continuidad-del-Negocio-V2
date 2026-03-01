import React from 'react';

/**
 * MetricsTab — Activa/desactiva el panel de gráficas de afectación.
 */
const MetricsTab = ({ showCharts, onToggleCharts }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Métricas y Análisis</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <button onClick={onToggleCharts} className={`btn-layer ${showCharts ? 'active' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>{showCharts ? 'Ocultar Informe' : 'Generar Informe de Afectación'}</span>
            </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px', textAlign: 'justify' }}>
            Las métricas detalladas se muestran como un panel flotante sobre el mapa. Actívelas para ver estadísticas en tiempo real.
        </p>
    </div>
);

export default MetricsTab;
