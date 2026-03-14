import React from 'react';

/**
 * Componente de encabezado para el dashboard.
 */
const DashboardHeader = ({ user, logout }) => {
    return (
        <header className="dashboard-header bg-blue-600 text-white flex justify-between items-center px-6 h-16 shadow-md z-[1000] backdrop-blur-md bg-opacity-90 border-b border-blue-400/20">
            <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-1.5 h-10 w-10 flex items-center justify-center shadow-inner">
                    <span className="text-2xl">🛡️</span>
                </div>
                <div>
                    <h1 className="header-title text-xl m-0 font-bold tracking-tight">Sistema de Gestión Continuidad del Negocio</h1>
                    <span className="header-subtitle text-xs opacity-80 font-medium uppercase tracking-wider">Panel de Control Profesional</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="user-info text-right hidden sm:block">
                    <span className="font-bold text-sm block">Bienvenido, {user?.name}</span>
                    <span className="text-[10px] opacity-75 uppercase tracking-widest">{user?.role}</span>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'admin' && (
                        <a href="/admin" className="no-underline">
                            <button className="bg-blue-800 hover:bg-blue-700 border border-blue-900/30 text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
                                🛠️ <span className="btn-text">Admin</span>
                            </button>
                        </a>
                    )}
                    <button 
                        onClick={logout} 
                        className="bg-red-600 hover:bg-red-500 border border-red-700/30 text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                    >
                        🚪 <span className="btn-text">Salir</span>
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .header-title { font-size: 0.9rem !important; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    .header-subtitle, .user-info, .btn-text { display: none !important; }
                }
            `}</style>
        </header>
    );
};

export default DashboardHeader;
