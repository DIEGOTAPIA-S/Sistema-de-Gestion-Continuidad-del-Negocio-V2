import React from 'react';

/**
 * Componente base para tarjetas con efecto de Glassmorphism.
 */
const GlassCard = ({ children, className = '', title, icon, onClick, light = false }) => {
    return (
        <div 
            onClick={onClick}
            className={`rounded-2xl p-4 transition-all duration-300 active:scale-[0.98] ${
                light 
                ? 'bg-white text-slate-800 border border-slate-200 shadow-sm' 
                : 'glass-panel border-white/10 text-white'
            } ${onClick ? 'cursor-pointer hover:border-blue-500/30' : ''} ${className}`}
        >
            {(title || icon) && (
                <div className={`flex items-center gap-3 mb-3 border-b pb-2 ${light ? 'border-slate-100' : 'border-white/10'}`}>
                    {icon && <span className="text-xl">{icon}</span>}
                    {title && <h3 className={`text-sm font-bold tracking-wide uppercase ${light ? 'text-slate-500' : 'opacity-90'}`}>{title}</h3>}
                </div>
            )}
            {children}
        </div>
    );
};

export default GlassCard;
