import React from 'react';

const MapDock = ({ activeTab, onTabChange }) => {
    const dockStyle = {
        width: '60px',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '10px',
        zIndex: 1002,
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
    };

    const itemStyle = (isActive) => ({
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        marginBottom: '10px',
        cursor: 'pointer',
        fontSize: '1.4rem',
        background: isActive ? '#eff6ff' : 'transparent',
        color: isActive ? '#2563eb' : '#64748b',
        border: isActive ? '1px solid #bfdbfe' : 'none',
        transition: 'all 0.2s ease'
    });

    const items = [
        { id: 'search', icon: '🔍', label: 'Búsqueda' },
        { id: 'layers', icon: '🗺️', label: 'Capas' },
        { id: 'metrics', icon: '📊', label: 'Métricas' },
        { id: 'data', icon: '📋', label: 'Datos' },
        { id: 'settings', icon: '⚙️', label: 'Config' }
    ];

    return (
        <div style={dockStyle}>
            {items.map(item => (
                <div
                    key={item.id}
                    style={itemStyle(activeTab === item.id)}
                    onClick={() => onTabChange(activeTab === item.id ? null : item.id)}
                    title={item.label}
                >
                    {item.icon}
                </div>
            ))}
        </div>
    );
};

export default MapDock;
