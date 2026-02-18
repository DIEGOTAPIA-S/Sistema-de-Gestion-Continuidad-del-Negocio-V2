import { useState } from 'react';
import MapDock from './MapDock';
import MapDrawer from './MapDrawer';

const Sidebar = (props) => {
    // Current Active Tab State (null = closed)
    const [activeTab, setActiveTab] = useState(null);

    const containerStyle = {
        position: 'relative', // Changed from absolute to relative to take up space in flex layout
        height: '100%',
        display: 'flex',
        zIndex: 1000,
        pointerEvents: 'auto' // Re-enable pointer events for the container
    };

    const dockWrapperStyle = {
        height: '100%',
        zIndex: 1002
    };

    const drawerWrapperStyle = {
        position: 'absolute',
        top: 0,
        left: '60px', // Start after the dock
        height: '100%',
        zIndex: 1001
    };

    return (
        <div style={containerStyle}>
            <div style={dockWrapperStyle}>
                <MapDock
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {activeTab && (
                <div style={drawerWrapperStyle}>
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
