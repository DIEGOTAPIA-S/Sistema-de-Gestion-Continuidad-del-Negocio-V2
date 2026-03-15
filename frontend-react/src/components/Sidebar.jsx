import { useState } from 'react';
import SidebarDock from './SidebarDock';
import MapDrawer from './MapDrawer';

const Sidebar = (props) => {
    // Current Active Tab State (null = closed)
    const [activeTab, setActiveTab] = useState(null);

    const containerStyle = {
        position: 'relative', 
        height: '100%',
        display: 'flex',
        zIndex: 1000,
        pointerEvents: 'auto' 
    };

    const dockWrapperStyle = {
        height: '100%',
        zIndex: 1002
    };

    const drawerWrapperStyle = {
        position: 'absolute',
        top: 0,
        left: '64px', // Alineado con el nuevo ancho del SidebarDock
        height: '100%',
        zIndex: 1001
    };

    return (
        <div style={containerStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .drawer-wrapper {
                        left: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
            <div style={dockWrapperStyle}>
                <SidebarDock 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
            </div>

            {activeTab && (
                <div style={drawerWrapperStyle} className="drawer-wrapper">
                    <MapDrawer
                        activeTab={activeTab}
                        onClose={() => setActiveTab(null)}
                        {...props}
                    />
                </div>
            )}
        </div>
    );
};

export default Sidebar;
