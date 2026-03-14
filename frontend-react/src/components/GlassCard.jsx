import React from 'react';

/**
 * Componente base para tarjetas con efecto de Glassmorphism.
 */
const GlassCard = ({ children, className = '', title, icon, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`glass-panel rounded-2xl p-4 transition-all duration-300 hover:border-white/20 active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {(title || icon) && (
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                    {icon && <span className="text-xl">{icon}</span>}
                    {title && <h3 className="text-sm font-bold tracking-wide uppercase opacity-90">{title}</h3>}
                </div>
            )}
            {children}
        </div>
    );
};

export default GlassCard;
