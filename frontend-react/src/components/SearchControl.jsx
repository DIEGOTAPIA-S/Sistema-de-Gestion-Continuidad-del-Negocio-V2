import { useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const SearchControl = () => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Ref to hold the current search marker
    const searchMarkerRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latLng = [lat, lon];

                // Fly to location
                map.flyTo(latLng, 14);

                // Remove existing marker if any
                if (searchMarkerRef.current) {
                    map.removeLayer(searchMarkerRef.current);
                }

                // Add new generic blue marker
                // Default Leaflet marker is blue
                const newMarker = L.marker(latLng).addTo(map);
                newMarker.bindPopup(`<b>${query}</b><br/>Ubicación encontrada`).openPopup();

                searchMarkerRef.current = newMarker;

            } else {
                alert('No hay resultados para esta búsqueda.');
            }
        } catch (error) {
            console.error("Error buscando dirección:", error);
            alert("Error al buscar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '60px', // Right of zoom controls
            zIndex: 1000,
            background: 'white',
            padding: '5px',
            borderRadius: '4px',
            boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
            display: 'flex',
            gap: '5px'
        }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar ciudad o dirección..."
                    style={{
                        padding: '5px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '250px',
                        fontSize: '14px'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 12px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? '...' : '🔍'}
                </button>
            </form>
        </div>
    );
};

export default SearchControl;
