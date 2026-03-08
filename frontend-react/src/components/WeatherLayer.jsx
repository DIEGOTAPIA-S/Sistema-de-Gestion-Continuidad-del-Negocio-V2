import { useState, useEffect } from 'react';
import { Marker, Popup, Circle, TileLayer } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

const WeatherLayer = ({ sedes, visible }) => {
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);      // Fix 2.1: estado de error visible
    const [radarTs, setRadarTs] = useState(null);  // Timestamp for RainViewer

    // Mapeo simple de códigos WMO a iconos/descripciones
    const getWeatherIcon = (code, isDay) => {
        if (code === 0) return isDay ? '☀️' : '🌙'; // Despejado
        if (code <= 3) return isDay ? '⛅' : '☁️'; // Nublado
        if (code <= 48) return '🌫️'; // Niebla
        if (code <= 55) return '🌦️'; // Llovizna
        if (code <= 67) return '🌧️'; // Lluvia
        if (code <= 77) return '❄️'; // Nieve
        if (code <= 82) return '⛈️'; // Chubascos
        if (code <= 99) return '⚡'; // Tormenta
        return '❓';
    };

    const getWeatherDesc = (code) => {
        const codes = {
            0: "Cielo despejado",
            1: "Mayormente claro", 2: "Parcialmente nublado", 3: "Nublado",
            45: "Niebla", 48: "Niebla con escarcha",
            51: "Llovizna ligera", 53: "Llovizna moderada", 55: "Llovizna densa",
            61: "Lluvia leve", 63: "Lluvia moderada", 65: "Lluvia fuerte",
            80: "Chubascos leves", 81: "Chubascos moderados", 82: "Chubascos violentos",
            95: "Tormenta eléctrica"
        };
        return codes[code] || "Condición desconocida";
    };

    const getZoneColor = (code, windSpeed) => {
        if (code >= 95 || windSpeed > 40) return '#dc2626'; // Rojo (Tormenta/Viento Fuerte)
        if (code >= 61) return '#3b82f6'; // Azul (Lluvia)
        if (code <= 3 && code > 0) return '#94a3b8'; // Gris (Nublado)
        return '#f59e0b'; // Amarillo (Sol/Normal)
    };

    // Fix 2.3: Una sola petición batch a Open-Meteo con todas las sedes
    // Antes: N peticiones en paralelo (una por sede) → Ahora: 1 sola petición
    useEffect(() => {
        if (!visible || !sedes.length) return;

        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                // Open-Meteo acepta arrays de lat/lon separados por coma → 1 petición
                const lats = sedes.map(s => s.latitud).join(',');
                const lngs = sedes.map(s => s.longitud).join(',');
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;

                const res = await axios.get(url);
                // Si hay múltiples ubicaciones, la respuesta es un array; si es una, es un objeto
                const results = Array.isArray(res.data) ? res.data : [res.data];
                const dataMap = {};
                sedes.forEach((sede, i) => {
                    if (results[i] && results[i].current) {
                        dataMap[sede.id] = results[i].current;
                    }
                });
                setWeatherData(dataMap);
            } catch (err) {
                console.error('Error cargando clima:', err);
                // Fix 2.1: mensaje de error visible al usuario
                setError('No se pudo cargar el clima. Verifique su conexión a internet.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 15 * 60 * 1000);
        return () => clearInterval(interval);

    }, [visible, sedes]);

    // Fetch RainViewer Timestamp
    useEffect(() => {
        if (!visible) return;
        const fetchRadarTs = async () => {
            try {
                const res = await axios.get('https://api.rainviewer.com/public/weather-maps.json');
                if (res.data && res.data.radar && res.data.radar.past) {
                    const past = res.data.radar.past;
                    const latest = past[past.length - 1];
                    setRadarTs(latest.time);
                }
            } catch (error) {
                console.error("Error fetching radar timestamp:", error);
            }
        };
        fetchRadarTs();
        const interval = setInterval(fetchRadarTs, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    return (
        <>
            {/* Fix 2.1: Mensaje de error visible si la API falla */}
            {error && (
                <div style={{
                    position: 'absolute', top: '10px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    padding: '6px 14px', borderRadius: '20px',
                    zIndex: 1000, fontSize: '0.8rem', color: '#dc2626',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* General Radar Layer (RainViewer) */}
            {radarTs && (
                <TileLayer
                    url={`https://tile.rainviewer.com/img/generated/${radarTs}/256/{z}/{x}/{y}.png?color=2&smooth=1`}
                    attribution='&copy; <a href="https://www.rainviewer.com/api.html">RainViewer</a>'
                    opacity={0.6}
                    zIndex={10}
                    crossOrigin="anonymous"
                />
            )}

            {/* Sede Markers */}
            {sedes.map(sede => {
                const weather = weatherData[sede.id];
                if (!weather) return null;

                const icon = getWeatherIcon(weather.weather_code, weather.is_day);
                const color = getZoneColor(weather.weather_code, weather.wind_speed_10m);

                const weatherIcon = L.divIcon({
                    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">${icon}</div>`,
                    className: 'weather-marker-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                return (
                    <div key={`weather-${sede.id}`}>
                        <Circle
                            center={[sede.latitud, sede.longitud]}
                            radius={5000}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.15,
                                weight: 1,
                                dashArray: '5, 10'
                            }}
                        />

                        <Marker position={[sede.latitud + 0.01, sede.longitud + 0.01]} icon={weatherIcon}>
                            <Popup>
                                <div className="p-2">
                                    <h4 className="font-bold text-gray-800 m-0 border-b pb-1">☁️ Clima Actual</h4>
                                    <p className="text-xs text-gray-500 mb-2">Sede: {sede.nombre}</p>

                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{icon}</span>
                                        <div>
                                            <p className="text-lg font-bold m-0">{weather.temperature_2m}°C</p>
                                            <p className="text-sm text-gray-600 m-0">{getWeatherDesc(weather.weather_code)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-2 rounded text-sm">
                                        <p className="m-0">💨 <strong>Viento:</strong> {weather.wind_speed_10m} km/h</p>
                                        {weather.wind_speed_10m > 30 && <p className="text-red-500 font-bold m-0 text-xs">⚠️ Vientos Fuertes</p>}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </div>
                );
            })}
        </>
    );
};

export default WeatherLayer;
