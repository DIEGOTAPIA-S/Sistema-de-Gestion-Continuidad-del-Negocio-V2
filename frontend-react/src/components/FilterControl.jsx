import { useState } from 'react';

const FilterControl = ({ onFilter }) => {
    const [search, setSearch] = useState('');
    const [minRto, setMinRto] = useState('');
    const [maxRto, setMaxRto] = useState('');
    const [criticality, setCriticality] = useState('');

    const handleFilter = () => {
        onFilter({
            search,
            minRto: minRto ? parseInt(minRto) : null,
            maxRto: maxRto ? parseInt(maxRto) : null,
            criticality
        });
    };

    const handleClear = () => {
        setSearch('');
        setMinRto('');
        setMaxRto('');
        setCriticality('');
        onFilter({ search: '', minRto: null, maxRto: null, criticality: '' });
    };

    return (
        <div className="card" style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <strong style={{ marginRight: '10px' }}>Filtros:</strong>

            <input
                type="text"
                placeholder="Buscar (Nombre, Ciudad, Proceso...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
            />

            <select
                value={criticality}
                onChange={e => setCriticality(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
                <option value="">-- Criticidad --</option>
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.8rem' }}>RTO (h):</span>
                <input
                    type="number"
                    placeholder="Min"
                    value={minRto}
                    onChange={e => setMinRto(e.target.value)}
                    style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <span>-</span>
                <input
                    type="number"
                    placeholder="Max"
                    value={maxRto}
                    onChange={e => setMaxRto(e.target.value)}
                    style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <button onClick={handleFilter} className="btn btn-primary" style={{ padding: '5px 10px' }}>Filtrar</button>
            <button onClick={handleClear} className="btn btn-ghost" style={{ padding: '5px 10px' }}>Limpiar</button>
        </div>
    );
};

export default FilterControl;
