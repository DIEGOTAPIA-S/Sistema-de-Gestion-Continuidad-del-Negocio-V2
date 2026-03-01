import React from 'react';
import SearchTab from './tabs/SearchTab';
import LayersTab from './tabs/LayersTab';
import MetricsTab from './tabs/MetricsTab';
import DataTab from './tabs/DataTab';
import SettingsTab from './tabs/SettingsTab';

/**
 * MapDrawer — Contenedor del panel lateral.
 * Solo se encarga de mostrar el tab correcto y el encabezado/pie.
 * Toda la lógica de cada sección vive en su propio archivo de tab.
 */
const MapDrawer = ({
    activeTab, onClose,
    // Data
    affectedSedes, nearbySedes, affectedColaboradores,
    colaboradores, sedes, earthquakeAlerts,
    // Actions
    onSave, onGenerateReport, onShowList, onShowHistory,
    onSimulateAlert, onLocate,
    // Layer toggles
    showCharts, onToggleCharts,
    showWeather, onToggleWeather,
    showTraffic, onToggleTraffic,
    showInfrastructure, onToggleInfrastructure,
    showColaboradores, onToggleColaboradores,
    showHeatmap, onToggleHeatmap,
    showEarthquakes, onToggleEarthquakes,
    showNews, onToggleNews,
    onShowHelp,
}) => {
    if (!activeTab) return null;

    const TAB_TITLES = {
        search: 'Búsqueda',
        layers: 'Capas & Visualización',
        metrics: 'Métricas',
        data: 'Datos & Reportes',
        settings: 'Ajustes',
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'search':
                return (
                    <SearchTab
                        sedes={sedes}
                        colaboradores={colaboradores}
                        onLocate={onLocate}
                    />
                );
            case 'layers':
                return (
                    <LayersTab
                        showColaboradores={showColaboradores} onToggleColaboradores={onToggleColaboradores}
                        showHeatmap={showHeatmap} onToggleHeatmap={onToggleHeatmap}
                        showWeather={showWeather} onToggleWeather={onToggleWeather}
                        showTraffic={showTraffic} onToggleTraffic={onToggleTraffic}
                        showInfrastructure={showInfrastructure} onToggleInfrastructure={onToggleInfrastructure}
                        showEarthquakes={showEarthquakes} onToggleEarthquakes={onToggleEarthquakes}
                        earthquakeAlerts={earthquakeAlerts}
                        onSimulateAlert={onSimulateAlert}
                        onLocate={onLocate}
                        onShowList={onShowList}
                    />
                );
            case 'metrics':
                return (
                    <MetricsTab
                        showCharts={showCharts}
                        onToggleCharts={onToggleCharts}
                    />
                );
            case 'data':
                return (
                    <DataTab
                        affectedSedes={affectedSedes}
                        nearbySedes={nearbySedes}
                        affectedColaboradores={affectedColaboradores}
                        onShowHistory={onShowHistory}
                        onSave={onSave}
                        onGenerateReport={onGenerateReport}
                    />
                );
            case 'settings':
                return (
                    <SettingsTab
                        showNews={showNews}
                        onToggleNews={onToggleNews}
                        onShowHelp={onShowHelp}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                width: '400px', height: '100%', background: '#ffffff',
                borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
                zIndex: 1001, boxShadow: '4px 0 15px rgba(0,0,0,0.1)', position: 'relative'
            }}
            className="drawer-container"
        >
            {/* Encabezado */}
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#334155' }}>
                    {TAB_TITLES[activeTab] || ''}
                </h3>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                >
                    &times;
                </button>
            </div>

            {/* Contenido del tab activo */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {renderTab()}
            </div>

            {/* Pie */}
            <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Continuidad de Negocio v2.1
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .drawer-container {
                        width: 100% !important;
                        position: fixed !important;
                        top: 0; left: 0;
                        z-index: 2000 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MapDrawer;
