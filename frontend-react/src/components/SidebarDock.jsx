import React from 'react';

/**
 * SidebarDock — Barra vertical de navegación (pestañas) para el Sidebar.
 * Sustituye a la antigua MapDock que fue sobreescrita por error.
 */
const SidebarDock = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'search', icon: '🔍', label: 'Búsqueda' },
        { id: 'layers', icon: '🗺️', label: 'Capas' },
        { id: 'metrics', icon: '📊', label: 'Métricas' },
        { id: 'data', icon: '💾', label: 'Datos' },
        { id: 'settings', icon: '⚙️', label: 'Ajustes' },
    ];

    return (
        <div className="h-full w-[64px] flex flex-col items-center py-4 gap-4 glass-panel border-r border-white/10 z-[1002]">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(activeTab === tab.id ? null : tab.id)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative group ${
                        activeTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' 
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                    title={tab.label}
                >
                    <span className="text-xl">{tab.icon}</span>
                    
                    {/* Tooltip personalizado */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase tracking-tighter">
                        {tab.label}
                    </span>
                    
                    {/* Indicador activo */}
                    {activeTab === tab.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default SidebarDock;
