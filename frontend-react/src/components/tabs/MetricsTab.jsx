import React from 'react';

/**
 * MetricsTab — Botones para el panel de análisis de afectación y el dashboard de métricas.
 */
const MetricsTab = ({ showCharts, onToggleCharts, showMetricsPanel, onToggleMetrics }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{ margin: '0 0 10px', color: '#64748b' }}>Métricas y Análisis</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>

            {/* Análisis de afectación del evento actual */}
            <button onClick={onToggleCharts} className={`btn-layer ${showCharts ? 'active' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                <span>{showCharts ? 'Ocultar Análisis de Impacto' : 'Análisis de Impacto del Evento'}</span>
            </button>

            {/* Dashboard de métricas generales de la empresa */}
            <button onClick={onToggleMetrics} className={`btn-layer ${showMetricsPanel ? 'active' : ''}`}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>{showMetricsPanel ? 'Ocultar Dashboard' : 'Dashboard de Métricas'}</span>
            </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', textAlign: 'justify', lineHeight: 1.5 }}>
            <strong>Análisis de impacto:</strong> gráficas de sedes afectadas por el evento activo.<br />
            <strong>Dashboard de métricas:</strong> eventos históricos, colaboradores por gerencia, modalidad y más.
        </p>
    </div>
);

export default MetricsTab;
