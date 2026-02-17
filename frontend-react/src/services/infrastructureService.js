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
    const bbox = `${south},${west},${north},${east}`;
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

        return response.data.elements.map(el => ({
            id: el.id,
            lat: el.lat || el.center.lat,
            lon: el.lon || el.center.lon,
            type: el.tags.amenity,
            name: el.tags.name || formatName(el.tags.amenity),
            phone: el.tags.phone || el.tags['contact:phone'] || 'No registrado'
        }));
    } catch (error) {
        console.error("Error fetching infrastructure:", error);
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
