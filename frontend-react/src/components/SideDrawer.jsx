import React from 'react';

/**
 * Panel lateral deslizable (Drawer) para reemplazar modales.
 */
const SideDrawer = ({ isOpen, onClose, title, children, width = 'w-96' }) => {
    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full ${width} bg-slate-900 shadow-2xl z-[2001] transition-transform duration-500 ease-out glass-panel border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">{title}</h2>
                        <button 
                            onClick={onClose}
                            className="text-slate-800 hover:text-black transition-colors text-3xl leading-none font-bold p-2"
                        >
                            ×
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideDrawer;
