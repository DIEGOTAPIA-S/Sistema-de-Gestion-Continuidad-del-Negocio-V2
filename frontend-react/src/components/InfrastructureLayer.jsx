import { useState, useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { policeIcon, fireIcon, hospitalIcon } from '../utils/mapIcons';

const InfrastructureLayer = ({ visible }) => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState(null);

    const map = useMapEvents({
        moveend: () => {
            if (visible && map.getZoom() > 12) { // Only fetch if visible and zoomed in
                setBounds(map.getBounds());
            }
        }
    });

    // Initial fetch if visible
    useEffect(() => {
        if (visible && map.getZoom() > 12) {
            setBounds(map.getBounds());
        }
    }, [visible, map]);

    useEffect(() => {
        if (!visible || !bounds) {
            setPoints([]); // Clear points if hidden
            return;
        }

        const fetchInfrastructure = async () => {
            setLoading(true);
            const { _southWest, _northEast } = bounds;
            const bbox = `${_southWest.lat},${_southWest.lng},${_northEast.lat},${_northEast.lng}`;

            // Query for Police, Fire, Hospitals
            const query = `
                [out:json][timeout:10];
                (
                  node["amenity"="police"](${bbox});
                  way["amenity"="police"](${bbox});
                  node["amenity"="fire_station"](${bbox});
                  way["amenity"="fire_station"](${bbox});
                  node["amenity"="hospital"](${bbox});
                  way["amenity"="hospital"](${bbox});
                );
                out center;
            `;

            try {
                const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
                    headers: { 'Content-Type': 'text/plain' }
                });

                const data = response.data.elements.map(el => ({
                    id: el.id,
                    lat: el.lat || el.center.lat,
                    lon: el.lon || el.center.lon,
                    type: el.tags.amenity,
                    name: el.tags.name || formatName(el.tags.amenity)
                }));

                setPoints(data);
                if (onUpdate) {
                    onUpdate(data);
                }
            } catch (error) {
                console.error("Error loading infrastructure:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchInfrastructure();
        }, 1000); // Debounce 1s to avoid spamming API

        return () => clearTimeout(timeoutId);

    }, [visible, bounds]);

    const formatName = (type) => {
        switch (type) {
            case 'police': return 'Estación de Policía';
            case 'fire_station': return 'Estación de Bomberos';
            case 'hospital': return 'Hospital / Clínica';
            default: return 'Infraestructura';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'police': return policeIcon;
            case 'fire_station': return fireIcon;
            case 'hospital': return hospitalIcon;
            default: return policeIcon;
        }
    };

    if (!visible) return null;

    return (
        <>
            {points.map(p => (
                <Marker key={p.id} position={[p.lat, p.lon]} icon={getIcon(p.type)}>
                    <Popup>
                        <strong>{p.name}</strong><br />
                        <span style={{ textTransform: 'capitalize' }}>{p.type.replace('_', ' ')}</span>
                    </Popup>
                </Marker>
            ))}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.8)',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    Cargando infraestructura... 📡
                </div>
            )}
            {visible && map.getZoom() <= 12 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.8)',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    color: '#f59e0b',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    Acerca el mapa para ver policía/hospitales 🔍
                </div>
            )}
        </>
    );
};

export default InfrastructureLayer;
