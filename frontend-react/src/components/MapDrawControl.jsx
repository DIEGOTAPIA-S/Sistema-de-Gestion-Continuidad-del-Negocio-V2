import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet Draw icons
import 'leaflet-draw';

window.type = true; // Hack for some leaflet-draw versions

const MapDrawControl = ({ onCreated, onDeleted }) => {
    const map = useMap();
    const featureGroupRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        // Add FeatureGroup to map to store drawn items
        map.addLayer(featureGroupRef.current);

        // Define options (only polygons and circles for zones)
        const drawControl = new L.Control.Draw({
            position: 'topright', // Move to top-right
            edit: {
                featureGroup: featureGroupRef.current,
                remove: true,
            },
            draw: {
                marker: false,
                circlemarker: false,
                polyline: false,
                rectangle: true,
                circle: true,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: {
                        color: '#ef4444', // Red for danger zones
                    }
                }
            }
        });

        map.addControl(drawControl);

        // Event listeners
        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            featureGroupRef.current.addLayer(layer);

            // Extract GeoJSON
            const geoJson = layer.toGeoJSON();
            if (onCreated) onCreated(geoJson, layer);
        });

        map.on(L.Draw.Event.DELETED, (e) => {
            if (onDeleted) onDeleted();
        });

        return () => {
            map.removeControl(drawControl);
            // map.removeLayer(featureGroupRef.current); // Keep layer if needed? No, cleanup.
        };
    }, [map, onCreated, onDeleted]);

    return null;
};

export default MapDrawControl;
