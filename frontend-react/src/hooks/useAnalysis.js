import { useState, useEffect } from 'react';
import { booleanPointInPolygon, point } from '@turf/turf';

/**
 * Custom hook para gestionar la lógica de análisis geoespacial y detección de afectación.
 */
const useAnalysis = (sedes, colaboradores) => {
    const [zones, setZones] = useState([]);
    const [affectedSedes, setAffectedSedes] = useState([]);
    const [nearbySedes, setNearbySedes] = useState([]);
    const [affectedColaboradores, setAffectedColaboradores] = useState([]);

    // Actualiza sedes afectadas y cercanas cuando las zonas cambian
    const handleAnalysisUpdate = (affected, nearby, currentZones) => {
        setAffectedSedes(affected);
        setNearbySedes(nearby);
        if (currentZones) setZones(currentZones);
    };

    // Calcula colaboradores afectados basándose en las zonas de riesgo
    useEffect(() => {
        if (zones && zones.length > 0 && colaboradores && colaboradores.length > 0) {
            const affected = colaboradores.filter(c => {
                if (!c.latitud || !c.longitud) return false;
                const pt = point([c.longitud, c.latitud]); // Turf usa [Lon, Lat]
                return zones.some(zone => booleanPointInPolygon(pt, zone));
            });
            setAffectedColaboradores(affected);
        } else {
            setAffectedColaboradores([]);
        }
    }, [zones, colaboradores]);

    return {
        zones, setZones,
        affectedSedes, setAffectedSedes,
        nearbySedes, setNearbySedes,
        affectedColaboradores, setAffectedColaboradores,
        handleAnalysisUpdate
    };
};

export default useAnalysis;
