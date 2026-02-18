import { useState, useEffect } from 'react';
import { CircleMarker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';

const EarthquakeLayer = ({ visible, onAlertsUpdate }) => {
    const [earthquakes, setEarthquakes] = useState([]);
    const [loading, setLoading] = useState(false);

    // URL del USGS: Sismos de magnitud 2.5+ en el último día
    // Usamos esta porque es pública, gratis y muy confiable.
    const USGS_API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

    useEffect(() => {
        // Removed (!visible) check to allow background monitoring
        const fetchEarthquakes = async () => {
            setLoading(true);
            try {
                const response = await axios.get(USGS_API_URL);
                // Filtro Estricto: Solo Colombia y sus fronteras directas
                const nameMatch = q.properties.place && q.properties.place.toLowerCase().includes('colombia');

                // Box 1: Colombia Continental (Aprox)
                // Lat: -4.5 a 13.5 | Lon: -79.5 (Chocó/Nariño) a -66 (Orinoquía)
                // Evita Panamá Central/Oeste, Ecuador profundo, Venezuela profunda
                const inMainland = (lat >= -4.5 && lat <= 13.5) && (lon >= -79.5 && lon <= -66.5);

                // Box 2: San Andrés y Providencia (Mar Caribe)
                // Lat: 11.5 a 14.0 | Lon: -82.0 a -81.0
                const inIslands = (lat >= 11.5 && lat <= 14.0) && (lon >= -82.0 && lon <= -81.0);

                return nameMatch || inMainland || inIslands;

                setEarthquakes(colQuakes);

                // Notificar al padre (Dashboard) para mostrar en la Sidebar y generar ALERTAS
                if (onAlertsUpdate) {
                    const alerts = colQuakes.map(f => ({
                        mag: f.properties.mag,
                        place: f.properties.place,
                        time: f.properties.time,
                        url: f.properties.url,
                        coordinates: f.geometry.coordinates // Pass coords for distance calc if needed
                    }));
                    onAlertsUpdate(alerts);
                }
            } catch (error) {
                console.error("Error fetching earthquake data:", error);
                // Silent fail in background
            } finally {
                setLoading(false);
            }
        };

        fetchEarthquakes();

        // Actualizar cada 5 minutos automáticamente
        const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000);
        return () => clearInterval(interval);

    }, []); // Empty dependency array to run constantly

    if (!visible) return null;

    // Función para determinar color según magnitud
    const getColor = (mag) => {
        return mag > 6 ? '#dc2626' : // Rojo intenso (Peligroso)
            mag > 4 ? '#ea580c' : // Naranja (Alerta)
                '#ca8a04';            // Amarillo (Menor)
    };

    // Función para calcular radio del círculo
    const getRadius = (mag) => {
        return mag * 4; // Escalar tamaño visualmente
    };

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
