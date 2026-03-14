import React from 'react';
import { downloadColaboradoresCSV } from '../utils/exportUtils';

/**
 * Banner de alerta de riesgo que aparece cuando hay sedes o colaboradores afectados.
 */
const RiskAlertBanner = ({ affectedSedes, nearbySedes, affectedColaboradores }) => {
    if (affectedSedes.length === 0 && nearbySedes.length === 0) return null;

    return (
        <div className="mx-5 mt-5 mb-0 bg-red-50/90 backdrop-blur-md p-4 rounded-2xl border border-red-200 shadow-lg flex justify-between items-center animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
                <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/30 animate-pulse">
                    <span className="text-xl">🚨</span>
                </div>
                <div>
                    <h5 className="m-0 text-red-900 font-bold text-lg flex items-center gap-2">
                        Zona de Riesgo Activa
                    </h5>
                    <div className="text-sm text-red-700/80 flex gap-6 mt-1 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="text-red-500">🏢</span> <strong>{affectedSedes.length}</strong> Sedes en peligro
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-500">👥</span> <strong>{affectedColaboradores.length}</strong> Empleados en riesgo
                        </div>
                    </div>
                </div>
            </div>
            
            {affectedColaboradores.length > 0 && (
                <button
                    onClick={() => downloadColaboradoresCSV(affectedColaboradores)}
                    className="bg-white hover:bg-red-50 border border-red-100 px-5 py-2.5 rounded-xl cursor-pointer text-red-700 font-bold text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                >
                    📊 Descargar Listado de Impacto
                </button>
            )}
        </div>
    );
};

export default RiskAlertBanner;
