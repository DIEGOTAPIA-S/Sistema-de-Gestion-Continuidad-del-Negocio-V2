import { useState } from 'react';
import { useMap } from 'react-leaflet';

const AdminSearchControl = ({ onLocationFound }) => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query) return;

        setLoading(true);
        console.log("Buscando:", query);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newPos = [parseFloat(lat), parseFloat(lon)];

                // Forzado de movimiento del mapa
                map.setView(newPos, 16);

                if (onLocationFound) {
                    onLocationFound({
                        lat: newPos[0],
                        lng: newPos[1],
                        address: display_name
                    });
                }
            } else {
                alert('No se encontraron resultados para esa dirección.');
            }
        } catch (error) {
            console.error("Error Nominatim:", error);
            alert("Error al conectar con el servicio de mapas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                width: '90%',
                maxWidth: '350px'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent map clicks when clicking search
        >
            <div className="flex bg-white shadow-2xl rounded-xl overflow-hidden border-2 border-blue-500/30">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearch();
                        }
                    }}
                    placeholder="🔍 Escriba dirección o sitio..."
                    className="flex-1 px-4 py-2.5 text-sm outline-none font-medium"
                />
                <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSearch();
                    }}
                    className="bg-blue-600 text-white px-4 py-2.5 font-bold transition-all hover:bg-blue-700 disabled:bg-slate-300"
                >
                    {loading ? '...' : 'BUSCAR'}
                </button>
            </div>
        </div>
    );
};

export default AdminSearchControl;
