import React from 'react';

/**
 * SettingsTab — Ajustes del panel: noticias y ayuda.
 */
const SettingsTab = ({ showNews, onToggleNews, onShowHelp }) => (
    <div>
        <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Configuración</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
                onClick={onToggleNews}
                className={`btn-layer ${showNews ? 'active' : ''}`}
                style={{ gridColumn: 'span 2' }}
            >
                <span style={{ fontSize: '1.5rem' }}>📰</span>
                <span>{showNews ? 'Ocultar Noticias' : 'Mostrar Noticias'}</span>
            </button>
            <button onClick={onShowHelp} className="btn-layer" style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '1.5rem' }}>❓</span>
                <span>Ayuda / Manual</span>
            </button>
        </div>
    </div>
);

export default SettingsTab;
