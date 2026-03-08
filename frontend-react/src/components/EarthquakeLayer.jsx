import { useState, useEffect } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';

/**
 * EarthquakeLayer — Capa de sismos en Colombia.
 *
 * Diseño:
 * - El MONITOREO (fetch al USGS) siempre está activo → el contador en la Sidebar
 *   se actualiza aunque la capa no esté visible en el mapa.
 * - El DIBUJO de círculos en el mapa solo ocurre cuando visible=true.
 *
 * Esto corrige la regresión donde al ocultar la capa se perdía el contador.
 */
const EarthquakeLayer = ({ visible, onAlertsUpdate }) => {
    const [earthquakes, setEarthquakes] = useState([]);
    const [loading, setLoading] = useState(false);

    const USGS_API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    // Monitoreo SIEMPRE activo (independiente de visible)
    // Actualiza el contador en la Sidebar aunque la capa esté oculta
    useEffect(() => {
        const fetchEarthquakes = async () => {
            setLoading(true);
            try {
                const response = await axios.get(USGS_API_URL);
                if (!response.data || !response.data.features) return;

                const colQuakes = response.data.features.filter(q => {
                    const [lon, lat] = q.geometry.coordinates;
                    const nameMatch = q.properties.place && q.properties.place.toLowerCase().includes('colombia');
                    // Colombia continental
                    const inMainland = (lat >= -4.5 && lat <= 13.5) && (lon >= -79.5 && lon <= -66.5);
                    // San Andrés y Providencia
                    const inIslands = (lat >= 11.5 && lat <= 14.0) && (lon >= -82.0 && lon <= -81.0);
                    return nameMatch || inMainland || inIslands;
                });

                setEarthquakes(colQuakes);

                // Siempre notificar al Dashboard para el contador en la Sidebar
                if (onAlertsUpdate) {
                    const alerts = colQuakes.map(f => ({
                        mag: f.properties.mag,
                        place: f.properties.place,
                        time: f.properties.time,
                        url: f.properties.url,
                        coordinates: f.geometry.coordinates
                    }));
                    onAlertsUpdate(alerts);
                }
            } catch (error) {
                console.error("Error fetching earthquake data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarthquakes();
        // Actualizar cada 5 minutos (siempre, no solo cuando visible)
        const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000);
        return () => clearInterval(interval);

    }, []); // Sin dependencia en visible — siempre monitorea

    // El DIBUJO en el mapa solo se renderiza cuando la capa está activa
    if (!visible) return null;

    const getColor = (mag) => {
        return mag > 6 ? '#dc2626' :
            mag > 4 ? '#ea580c' :
                '#ca8a04';
    };

    const getRadius = (mag) => mag * 4;

    return (
        <>
            {earthquakes.map((quake) => (
                <CircleMarker
                    key={quake.id}
                    center={[quake.geometry.coordinates[1], quake.geometry.coordinates[0]]}
                    pathOptions={{
                        color: getColor(quake.properties.mag),
                        fillColor: getColor(quake.properties.mag),
                        fillOpacity: 0.6,
                        weight: 1
                    }}
                    radius={getRadius(quake.properties.mag)}
                >
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-slate-800 text-lg border-b pb-1 mb-2">
                                ⚡ Sismo Detectado
                            </h3>
                            <div className="space-y-1 text-sm text-slate-600">
                                <p><strong className="text-slate-900">Magnitud:</strong> {quake.properties.mag}</p>
                                <p><strong className="text-slate-900">Ubicación:</strong> {quake.properties.place}</p>
                                <p><strong className="text-slate-900">Hora:</strong> {new Date(quake.properties.time).toLocaleString()}</p>
                                <p><strong className="text-slate-900">Profundidad:</strong> {quake.geometry.coordinates[2]} km</p>
                                <a
                                    href={quake.properties.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-3 text-blue-600 hover:underline font-medium"
                                >
                                    Ver reporte oficial ↗
                                </a>
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

export default EarthquakeLayer;
