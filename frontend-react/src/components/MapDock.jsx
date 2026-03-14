import React from 'react';

/**
 * Barra de herramientas flotante (Dock) en la parte inferior del mapa.
 */
const MapDock = ({ 
    onGenerateReport, 
    onSaveEvent, 
    onShowHistory, 
    onShowList, 
    onShowHelp,
    showCharts,
    onToggleCharts,
    showMetrics,
    onToggleMetrics,
    affectedCount = 0
}) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 p-2 glass-panel rounded-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom duration-700">
            {/* Action Group: Data */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                <DockButton onClick={onShowList} icon="🏢" label="Sedes" />
                <DockButton onClick={onToggleCharts} icon="📊" label="Análisis" active={showCharts} />
                <DockButton onClick={onToggleMetrics} icon="📈" label="Métricas" active={showMetrics} />
            </div>

            {/* Action Group: Events */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                <DockButton onClick={onShowHistory} icon="📜" label="Historial" />
                <button 
                    onClick={onSaveEvent}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    💾 Registrar Evento
                </button>
            </div>

            {/* Action Group: Output */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={onGenerateReport}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                    🖨️ Reporte PDF
                </button>
                <DockButton onClick={onShowHelp} icon="❓" label="Ayuda" />
            </div>

            {/* Notification Badge if critical */}
            {affectedCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce shadow-lg">
                    {affectedCount}
                </div>
            )}
        </div>
    );
};

const DockButton = ({ onClick, icon, label, active = false }) => (
    <button 
        onClick={onClick}
        title={label}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-90 ${active ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/10 text-slate-300 hover:text-white'}`}
    >
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-xs font-bold hidden lg:inline">{label}</span>
    </button>
);

export default MapDock;
