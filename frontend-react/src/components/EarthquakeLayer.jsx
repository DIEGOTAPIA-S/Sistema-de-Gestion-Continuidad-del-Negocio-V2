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

    const SGC_API_URL = "https://archive.sgc.gov.co/feed/v1.0/summary/five_days_all.json";

    // Monitoreo SIEMPRE activo (independiente de visible)
    // Actualiza el contador en la Sidebar aunque la capa esté oculta
    useEffect(() => {
        const fetchEarthquakes = async () => {
            setLoading(true);
            try {
                const response = await axios.get(SGC_API_URL);
                if (!response.data || !response.data.features) return;

                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const colQuakes = response.data.features.filter(q => {
                    const [lat, lon] = q.geometry.coordinates;
                    const place = q.properties.place || '';
                    const isColombia = place.toLowerCase().includes('colombia');
                    
                    // Colombia continental simplificado para el feed local
                    const inMainland = (lat >= -4.5 && lat <= 13.5) && (lon >= -79.5 && lon <= -66.5);
                    const inIslands = (lat >= 11.5 && lat <= 15.0) && (lon >= -82.0 && lon <= -78.0);
                    
                    // Filtro de 24 horas
                    const quakeTime = new Date(q.properties.utcTime + " UTC"); // Forzamos UTC ya que el feed viene en ese formato
                    const isRecent = quakeTime >= twentyFourHoursAgo;

                    return (isColombia || inMainland || inIslands) && isRecent;
                });

                setEarthquakes(colQuakes);

                // Notificar al Dashboard para el contador en la Sidebar
                if (onAlertsUpdate) {
                    const alerts = colQuakes.map(f => ({
                        mag: f.properties.mag,
                        place: f.properties.place,
                        time: f.properties.utcTime, // SGC usa utcTime o localTime como string
                        id: f.id,
                        coordinates: f.geometry.coordinates // [Lat, Lon, Depth]
                    }));
                    onAlertsUpdate(alerts);
                }
            } catch (error) {
                console.error("Error fetching SGC earthquake data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarthquakes();
        // Actualizar cada 5 minutos
        const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000);
        return () => clearInterval(interval);

    }, []);

    // El DIBUJO en el mapa solo se renderiza cuando la capa está activa
    if (!visible) return null;

    const getColor = (mag) => {
        if (mag >= 5.0) return '#dc2626'; // Rojo - Fuerte
        if (mag >= 3.0) return '#ea580c'; // Naranja - Medio
        return '#ca8a04'; // Amarillo - Leve
    };

    const getRadius = (mag) => Math.max(mag * 4, 6);

    return (
        <>
            {earthquakes.map((quake) => (
                <CircleMarker
                    key={quake.id}
                    center={[quake.geometry.coordinates[0], quake.geometry.coordinates[1]]} // SGC: [Lat, Lon]
                    pathOptions={{
                        color: getColor(quake.properties.mag),
                        fillColor: getColor(quake.properties.mag),
                        fillOpacity: 0.6,
                        weight: 1
                    }}
                    radius={getRadius(quake.properties.mag)}
                >
                    <Popup>
                        <div className="p-2 min-w-[220px]">
                            <h3 className="font-bold text-slate-800 text-lg border-b pb-1 mb-2">
                                ⚡ Sismo Detectado (SGC)
                            </h3>
                            <div className="space-y-1 text-sm text-slate-600">
                                <p><strong className="text-slate-900">Magnitud:</strong> {quake.properties.mag} {quake.properties.magType}</p>
                                <p><strong className="text-slate-900">Ubicación:</strong> {quake.properties.place}</p>
                                <p><strong className="text-slate-900">Hora Local:</strong> {quake.properties.localTime}</p>
                                <p><strong className="text-slate-900">Profundidad:</strong> {quake.geometry.coordinates[2]} km</p>
                                <p><strong className="text-slate-900">Estado:</strong> {quake.properties.status === 'manual' ? 'Revisado' : 'Automático'}</p>
                                <a
                                    href={`https://www.sgc.gov.co/sismos/sismos/${quake.id}.html`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-3 text-blue-600 hover:underline font-medium"
                                >
                                    Ver detalle en SGC ↗
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
