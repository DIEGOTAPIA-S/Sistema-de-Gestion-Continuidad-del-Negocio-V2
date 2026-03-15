import axios from 'axios';

const formatName = (type) => {
    switch (type) {
        case 'police': return 'Estación de Policía';
        case 'fire_station': return 'Estación de Bomberos';
        case 'hospital': return 'Hospital / Clínica';
        default: return 'Infraestructura';
    }
};

export const fetchInfrastructureByBBox = async (south, west, north, east) => {
    try {
        // 1. Cargar datos oficiales de nuestra base de datos (Prioridad)
        const localResponse = await axios.get('/api/entidades-apoyo/', {
            params: {
                lat_min: south,
                lat_max: north,
                lon_min: west,
                lon_max: east
            }
        });
        
        const localPoints = localResponse.data.map(el => ({
            id: `local-${el.id}`,
            lat: parseFloat(el.latitud),
            lon: parseFloat(el.longitud),
            type: el.tipo,
            name: el.nombre,
            address: el.direccion || 'No registrada',
            phone: el.telefono || '',
            isOfficial: true,
            fuente: el.fuente || 'Base de datos interna'
        }));

        // 2. Cargar datos complementarios de OSM (Overpass)
        const bbox = `${south},${west},${north},${east}`;
        const query = `
            [out:json][timeout:15];
            (
              node["amenity"~"police|fire_station|hospital|clinic|doctors"](${bbox});
              way["amenity"~"police|fire_station|hospital|clinic|doctors"](${bbox});
            );
            out center;
        `;

        const osmResponse = await axios.post('https://overpass-api.de/api/interpreter', query, {
            headers: { 'Content-Type': 'text/plain' }
        });

        const osmPoints = osmResponse.data.elements.map(el => {
            const tags = el.tags || {};
            return {
                id: `osm-${el.id}`,
                lat: el.lat || (el.center ? el.center.lat : null),
                lon: el.lon || (el.center ? el.center.lon : null),
                type: tags.amenity,
                name: tags.name || formatName(tags.amenity),
                address: (tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : '').trim(),
                phone: tags.phone || tags['contact:phone'] || tags.mobile || '',
                isOfficial: false,
                fuente: 'OpenStreetMap'
            };
        }).filter(p => p.lat && p.lon);

        // 3. Combinar y Deduplicar (Lógica similar a InfrastructureLayer)
        const finalPoints = [...localPoints];
        osmPoints.forEach(osmP => {
            const isDuplicate = localPoints.some(localP => {
                const dist = Math.sqrt(Math.pow(localP.lat - osmP.lat, 2) + Math.pow(localP.lon - osmP.lon, 2));
                return dist < 0.0012; // Aprox 130m
            });
            if (!isDuplicate) finalPoints.push(osmP);
        });

        return finalPoints;

    } catch (error) {
        console.error("Error fetching unified infrastructure:", error);
        return [];
    }
};

export const fetchInfrastructureNearPoint = async (lat, lon, radiusKm = 5) => {
    // Approx conversion: 1 deg lat = 111km. 1 deg lon = 111km * cos(lat)
    const latOffset = radiusKm / 111;
    const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const south = lat - latOffset;
    const north = lat + latOffset;
    const west = lon - lonOffset;
    const east = lon + lonOffset;

    return await fetchInfrastructureByBBox(south, west, north, east);
};
