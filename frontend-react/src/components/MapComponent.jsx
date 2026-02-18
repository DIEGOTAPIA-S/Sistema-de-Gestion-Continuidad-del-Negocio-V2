import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'; // Added useMap, ZoomControl
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { normalIcon, dangerIcon, warningIcon } from '../utils/mapIcons';
import MapDrawControl from './MapDrawControl';
import SearchControl from './SearchControl';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle programmatic map movements
const MapController = ({ focusLocation }) => {
    const map = useMap();
    useEffect(() => {
        console.log("MapController received focusLocation:", focusLocation);
        if (focusLocation && focusLocation.coords) {
            console.log("Flying to:", focusLocation.coords);
            map.flyTo(focusLocation.coords, focusLocation.zoom || 8, { // Use provided zoom or default to 8
                animate: true,
                duration: 2
            });
        }
    }, [focusLocation, map]);
    return null;
};

const MapComponent = ({ sedes, onAnalysisUpdate, children, focusLocation }) => {
    const [analyzedSedes, setAnalyzedSedes] = useState([]);
    const [zones, setZones] = useState([]);

    const handleZoneCreated = (geoJson, layer) => {
        const newZones = [...zones, geoJson];
        setZones(newZones);
        analyzeImpact(newZones, sedes);
    };

    const handleZoneDeleted = () => {
        setZones([]);
        setAnalyzedSedes(sedes.map(s => ({ ...s, status: 'normal' })));
        onAnalysisUpdate && onAnalysisUpdate([], []);
    };

    const analyzeImpact = (currentZones, currentSedes) => {
        if (!currentZones.length || !currentSedes) {
            setAnalyzedSedes(currentSedes ? currentSedes.map(s => ({ ...s, status: 'normal' })) : []);
            onAnalysisUpdate && onAnalysisUpdate([], []);
            return;
        }

        const affected = [];
        const nearby = [];

        const updatedSedes = currentSedes.map(sede => {
            const point = turf.point([sede.longitud, sede.latitud]);
            let status = 'normal';

            const isInside = currentZones.some(zone => {
                const polygon = turf.polygon(zone.geometry.coordinates);
                return turf.booleanPointInPolygon(point, polygon);
            });

            if (isInside) {
                status = 'affected';
                affected.push(sede);
            } else {
                // Simple 2km buffer check
                const isNearby = currentZones.some(zone => {
                    const polygon = turf.polygon(zone.geometry.coordinates);
                    const buffered = turf.buffer(polygon, 2, { units: 'kilometers' });
                    return turf.booleanPointInPolygon(point, buffered);
                });

                if (isNearby) {
                    status = 'nearby';
                    nearby.push(sede);
                }
            }
            return { ...sede, status };
        });

        setAnalyzedSedes(updatedSedes);
        onAnalysisUpdate && onAnalysisUpdate(affected, nearby, currentZones);
    };

    useEffect(() => {
        if (sedes && sedes.length > 0) {
            analyzeImpact(zones, sedes);
        }
    }, [sedes]);

    return (
        <div className="card" style={{ height: '100%', width: '100%', padding: 0, overflow: 'hidden', borderRadius: '0' }}>
            <MapContainer center={[4.6097, -74.0817]} zoom={6} style={{ height: '100%', width: '100%' }} preferCanvas={true} zoomControl={false}> {/* Disable default Zoom */}
                <ZoomControl position="topright" /> {/* Add custom Zoom at top-right */}
                <MapController focusLocation={focusLocation} />
                <SearchControl />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {children}
                <MapDrawControl onCreated={handleZoneCreated} onDeleted={handleZoneDeleted} />

                {(analyzedSedes.length > 0 ? analyzedSedes : sedes).map((sede) => (
                    <Marker
                        key={sede.id}
                        position={[sede.latitud, sede.longitud]}
                        zIndexOffset={1000}
                        icon={sede.status === 'affected' ? dangerIcon : (sede.status === 'nearby' ? warningIcon : normalIcon)}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{sede.nombre}</h3>
                                <p style={{ margin: '0', fontSize: '0.9em', color: '#64748b' }}>{sede.direccion}</p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    marginTop: '5px',
                                    color: 'white',
                                    background: sede.status === 'affected' ? '#ef4444' : (sede.status === 'nearby' ? '#f59e0b' : '#3b82f6')
                                }}>
                                    {sede.status === 'affected' ? '⚠️ Afectada' : (sede.status === 'nearby' ? '⚠️ Cercana (2km)' : '✅ Operativa')}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
