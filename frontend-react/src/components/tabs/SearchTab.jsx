import React, { useState } from 'react';

/**
 * SearchTab — Tab de búsqueda universal de sedes y colaboradores.
 * Recibe las listas y una función para volar el mapa al resultado.
 */
const SearchTab = ({ sedes, colaboradores, onLocate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        const matchedSedes = sedes.filter(s =>
            s.nombre.toLowerCase().includes(lowerQuery) ||
            s.direccion.toLowerCase().includes(lowerQuery)
        ).map(s => ({ ...s, type: 'sede', label: s.nombre, subLabel: s.direccion }));

        const matchedColabs = colaboradores.filter(c =>
            (c.nombres && c.nombres.toLowerCase().includes(lowerQuery)) ||
            (c.apellidos && c.apellidos.toLowerCase().includes(lowerQuery)) ||
            (c.cargo && c.cargo.toLowerCase().includes(lowerQuery)) ||
            (c.area && c.area.toLowerCase().includes(lowerQuery)) ||
            (c.compania && c.compania.toLowerCase().includes(lowerQuery))
        ).map(c => ({
            ...c,
            type: 'colaborador',
            label: `${c.nombres} ${c.apellidos}`,
            subLabel: `${c.cargo} - ${c.compania || ''}`
        }));

        setSearchResults([...matchedSedes, ...matchedColabs].slice(0, 50));
    };

    return (
        <div>
            <h4 style={{ margin: '0 0 15px', color: '#64748b' }}>Búsqueda Universal</h4>
            <input
                type="text"
                placeholder="🔍 Buscar Sede, Colaborador, Cargo..."
                value={searchQuery}
                onChange={handleSearch}
                autoFocus
                style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
            />
            {searchResults.length > 0 && (
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '15px 0 0',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {searchResults.map((item, idx) => (
                        <li
                            key={idx}
                            onClick={() => onLocate && onLocate(item)}
                            style={{
                                padding: '12px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                gap: '12px',
                                background: 'white',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            <span style={{ fontSize: '1.5rem' }}>
                                {item.type === 'sede' ? '🏢' : '👤'}
                            </span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.subLabel}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {searchQuery && searchResults.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    No se encontraron resultados.
                </div>
            )}
        </div>
    );
};

export default SearchTab;
