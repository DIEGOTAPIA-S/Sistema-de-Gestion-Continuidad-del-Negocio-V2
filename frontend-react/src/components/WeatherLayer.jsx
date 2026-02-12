import { useState, useEffect } from 'react';
import { Marker, Popup, Circle, TileLayer } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

const WeatherLayer = ({ sedes, visible }) => {
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(false);
    const [radarTs, setRadarTs] = useState(null); // Timestamp for RainViewer

    // Mapeo simple de códigos WMO a iconos/descripciones
    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️'; // Despejado
        if (code <= 3) return '⛅'; // Nublado
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

    // Determine color based on severity (Rain/Storm = Alert)
    const getZoneColor = (code, windSpeed) => {
        if (code >= 95 || windSpeed > 40) return '#dc2626'; // Rojo (Tormenta/Viento Fuerte)
        if (code >= 61) return '#3b82f6'; // Azul (Lluvia)
        if (code <= 3 && code > 0) return '#94a3b8'; // Gris (Nublado)
        return '#f59e0b'; // Amarillo (Sol/Normal)
    };

    // Fetch Weather Data (Open-Meteo) for Sedes
    useEffect(() => {
        if (!visible || !sedes.length) return;

        const fetchWeather = async () => {
            setLoading(true);
            const dataMap = {};

            const promises = sedes.map(async (sede) => {
                try {
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${sede.latitud}&longitude=${sede.longitud}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
                    const res = await axios.get(url);
                    return { id: sede.id, data: res.data.current };
                } catch (err) {
                    console.error(`Error clima sede ${sede.nombre}:`, err);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            results.forEach(res => {
                if (res) dataMap[res.id] = res.data;
            });

            setWeatherData(dataMap);
            setLoading(false);
        };

        fetchWeather();
        // Update every 15 mins
        const interval = setInterval(fetchWeather, 15 * 60 * 1000);
        return () => clearInterval(interval);

    }, [visible, sedes]);

    // Fetch RainViewer Timestamp
    useEffect(() => {
        if (!visible) return;
        const fetchRadarTs = async () => {
            try {
                // RainViewer public API to get available timestamps
                const res = await axios.get('https://api.rainviewer.com/public/weather-maps.json');
                if (res.data && res.data.radar && res.data.radar.past) {
                    const past = res.data.radar.past;
                    // Get the latest available past timestamp
                    const latest = past[past.length - 1];
                    setRadarTs(latest.time);
                }
            } catch (error) {
                console.error("Error fetching radar timestamp:", error);
            }
        };
        fetchRadarTs();
        // Update radar every 10 mins
        const interval = setInterval(fetchRadarTs, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    return (
        <>
            {/* General Radar Layer (RainViewer) */}
            {radarTs && (
                <TileLayer
                    url={`https://tile.rainviewer.com/img/generated/${radarTs}/256/{z}/{x}/{y}.png?color=2&smooth=1`}
                    attribution='&copy; <a href="https://www.rainviewer.com/api.html">RainViewer</a>'
                    opacity={0.6}
                    zIndex={10} // Above base map, below markers
                />
            )}

            {/* Sede Markers */}
            {sedes.map(sede => {
                const weather = weatherData[sede.id];
                if (!weather) return null;

                const icon = getWeatherIcon(weather.weather_code);
                const color = getZoneColor(weather.weather_code, weather.wind_speed_10m);

                // Create a custom DivIcon for the weather symbol
                const weatherIcon = L.divIcon({
                    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">${icon}</div>`,
                    className: 'weather-marker-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                return (
                    <div key={`weather-${sede.id}`}>
                        {/* Area of Influence (Visual Range) */}
                        <Circle
                            center={[sede.latitud, sede.longitud]}
                            radius={5000} // 5km radius as requested for "Range"
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.15,
                                weight: 1,
                                dashArray: '5, 10'
                            }}
                        />

                        {/* Weather Marker offset slightly or on top */}
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
