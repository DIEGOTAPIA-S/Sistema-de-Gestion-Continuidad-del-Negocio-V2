import { useState, useEffect } from 'react';
import { Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { policeIcon, fireIcon, hospitalIcon } from '../utils/mapIcons';

const InfrastructureLayer = ({ visible, onUpdate }) => {
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

    // Sync with parent whenever points change
    useEffect(() => {
        if (onUpdate) {
            onUpdate(points);
        }
    }, [points, onUpdate]);

    useEffect(() => {
        if (!visible || !bounds) {
            setPoints([]);
            return;
        }

        const fetchInfrastructure = async () => {
            setLoading(true);
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

            try {
                // 1. Cargar datos locales (Oficiales de IDECA cargados por el usuario)
                // Ahora filtramos por BBOX en el servidor para mayor eficiencia
                const localResponse = await axios.get('/api/entidades-apoyo/', {
                    params: {
                        lat_min: sw.lat,
                        lat_max: ne.lat,
                        lon_min: sw.lng,
                        lon_max: ne.lng
                    }
                });
                const localPoints = localResponse.data
                    .filter(el => el.nombre && el.nombre !== 'Sin nombre')  // Saltar registros sin nombre
                    .map(el => ({
                        id: `local-${el.id}`,
                        lat: parseFloat(el.latitud),
                        lon: parseFloat(el.longitud),
                        type: el.tipo,
                        name: el.nombre,
                        address: el.direccion && el.direccion.trim() !== '' ? el.direccion : 'No registrada',
                        phone: el.telefono && el.telefono.trim() !== '' && el.telefono !== 'None' ? el.telefono.trim() : '',
                        isOfficial: true,
                        fuente: el.fuente
                    }));

                // 2. Cargar datos de OSM (Overpass) como complemento
                const query = `
                    [out:json][timeout:15];
                    (
                      nwr["amenity"="police"](${bbox});
                      nwr["amenity"="fire_station"](${bbox});
                      nwr["amenity"="hospital"](${bbox});
                    );
                    out center;
                `;

                const osmResponse = await axios.post('https://overpass-api.de/api/interpreter', query, {
                    headers: { 'Content-Type': 'text/plain' }
                });

                const forbiddenWords = ['cancha', 'microfutbol', 'parque', 'salon comunal', 'coliseo',
                    'veterinaria', 'veterinario', 'animal', 'mascota', 'pet shop',
                    'zoo', 'acuario', 'estetica', 'peluqueria', 'spa', 'gym',
                    'gimnasio', 'fitness', 'bodytech', 'crossfit'];

                // Función para validar que un nombre de OSM es una institución real
                const isValidOsmName = (rawName) => {
                    if (!rawName || rawName.length < 5) return false; // Muy corto
                    const name = rawName.toLowerCase();
                    if (forbiddenWords.some(w => name.includes(w))) return false;
                    // Debe contener al menos una vocal y no ser solo repeticiones
                    const hasVowel = /[aeiouáéíóú]/.test(name);
                    // Detectar nombres tipo 'kekerkre' (sin espacios y con muchas consonantes)
                    const hasSpace = name.includes(' ');
                    const hasInstitutionWord = /(hospital|clinica|clínica|centro|salud|policia|policía|bombero|caps|urgenc|emed|medico|médico|ips|eps)/i.test(name);
                    return hasVowel && (hasSpace || hasInstitutionWord);
                };

                const osmPoints = osmResponse.data.elements
                    .filter(el => {
                        const name = el.tags && el.tags.name;
                        // Si tiene nombre, debe pasar la validación; si no tiene nombre usamos el tipo (siempre válido)
                        return !name || isValidOsmName(name);
                    })
                    .map(el => ({
                        id: `osm-${el.id}`,
                        lat: el.lat || (el.center ? el.center.lat : null),
                        lon: el.lon || (el.center ? el.center.lon : null),
                        type: el.tags.amenity,
                        name: el.tags.name || formatName(el.tags.amenity),
                        address: (el.tags['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` : 'No registrada').trim(),
                        phone: el.tags.phone || el.tags['contact:phone'] || '',
                        isOfficial: false,
                        fuente: 'OpenStreetMap'
                    }))
                    .filter(p => p.lat && p.lon);

                // Combinar y Deduplicar: Si un punto OSM está muy cerca de uno local, preferir el local
                const finalPoints = [...localPoints];

                osmPoints.forEach(osmP => {
                    const exists = localPoints.some(localP => {
                        const dist = Math.sqrt(Math.pow(localP.lat - osmP.lat, 2) + Math.pow(localP.lon - osmP.lon, 2));
                        return dist < 0.0015; // Un poco más amplio para capturar duplicados
                    });
                    if (!exists) {
                        finalPoints.push(osmP);
                    }
                });

                setPoints(finalPoints);

            } catch (error) {
                console.error("Error loading infrastructure:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchInfrastructure();
        }, 1000);

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
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        <strong>{p.name}</strong>
                    </Tooltip>
                    <Popup>
                        <div style={{ minWidth: '180px' }}>
                            <strong style={{ fontSize: '1.1rem', color: '#1e40af', display: 'block', marginBottom: '8px' }}>
                                {p.name}
                            </strong>
                            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>
                                <span style={{ fontWeight: 'bold' }}>📍 Tipo:</span> {formatName(p.type)}<br />
                                <span style={{ fontWeight: 'bold' }}>🏠 Dir:</span>{' '}
                                {p.address && p.address !== 'No registrada'
                                    ? p.address
                                    : <em style={{ color: '#94a3b8' }}>No registrada</em>
                                }<br />
                                {/* Para datos oficiales, siempre mostrar la fila de teléfono */}
                                {(p.isOfficial || p.phone) && (
                                    <>
                                        <span style={{ fontWeight: 'bold' }}>📞 Tel:</span>{' '}
                                        {p.phone && p.phone !== ''
                                            ? p.phone
                                            : <em style={{ color: '#94a3b8' }}>No registrado</em>
                                        }<br />
                                    </>
                                )}
                                <div style={{
                                    marginTop: '12px',
                                    padding: '6px',
                                    background: p.isOfficial ? '#dcfce7' : '#f1f5f9',
                                    color: p.isOfficial ? '#166534' : '#475569',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    border: p.isOfficial ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                }}>
                                    {p.isOfficial ? '✅ DATO OFICIAL' : '🌐 Respaldo Internet'}<br />
                                    <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Fuente: {p.fuente}</span>
                                </div>
                            </div>
                        </div>
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
                    color: '#0f172a',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    Cargando red de apoyo... 📡
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
                    color: '#c2410c',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }} text-brand-dark>
                    Acerca el mapa para ver la red de apoyo 🔍
                </div>
            )}
        </>
    );
};

export default InfrastructureLayer;
