import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points, visible }) => {
    const map = useMap();

    useEffect(() => {
        if (!visible || !points || points.length === 0) return;

        // Extract points as [lat, lon, intensity]
        // Aumentamos la intensidad base a 1.0 para que las zonas densas lleguen a rojo rápido
        const heatPoints = points.map(p => [p.latitud, p.longitud, 1.0]);

        const heatLayer = L.heatLayer(heatPoints, {
            radius: 18, // Radio un poco más pequeño para mayor definición
            blur: 12,
            maxZoom: 10, // Ajuste para que a zooms altos no se desvanezca
            gradient: {
                0.2: 'blue',
                0.4: 'cyan',
                0.6: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, visible]);

    return null;
};

export default HeatmapLayer;
