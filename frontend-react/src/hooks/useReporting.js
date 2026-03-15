import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { generatePDFReport } from '../utils/reportGenerator';
import { fetchInfrastructureNearPoint } from '../services/infrastructureService';

/**
 * Custom hook para gestionar la generación de reportes PDF y captura de pantalla.
 */
const useReporting = (user, affectedSedes, nearbySedes, affectedColaboradores, eventDetails, infrastructurePoints) => {
    
    const handleGenerateReport = async (options = {}, sedesWithStatus) => {
        try {
            // Captura del Mapa con html-to-image (más fiable que html2canvas para Leaflet)
            const mapElement = document.getElementById('map-capture');
            let mapImg = null;
            if (mapElement) {
                try {
                    // Esperar un momento para asegurar que las capas estén renderizadas
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    mapImg = await toPng(mapElement, {
                        backgroundColor: '#ffffff',
                        quality: 0.95,
                        pixelRatio: 1.5, // Balance entre calidad y tamaño de archivo
                        filter: (node) => {
                            // Ignorar controles de Leaflet
                            if (node && node.classList) {
                                return !(
                                    node.classList.contains('leaflet-control-container') ||
                                    node.classList.contains('leaflet-draw-toolbar')
                                );
                            }
                            return true;
                        }
                    });
                } catch (mapErr) {
                    console.error("Error capturando Mapa con toPng:", mapErr);
                }
            }

            // Gráficas: No capturamos imagen aquí porque reportGenerator las dibuja de forma nativa
            const chartsImg = null;

            // Gestión de Infraestructura para el reporte
            let reportInfrastructure = infrastructurePoints;
            if ((!reportInfrastructure || reportInfrastructure.length === 0) && (affectedSedes.length > 0 || nearbySedes.length > 0)) {
                try {
                    const targetSedes = affectedSedes.length > 0 ? affectedSedes : nearbySedes;
                    const uniquePoints = new Map();
                    const promises = targetSedes.map(sede =>
                        fetchInfrastructureNearPoint(sede.latitud, sede.longitud, 5)
                    );
                    const results = await Promise.all(promises);
                    results.flat().forEach(point => {
                        if (!uniquePoints.has(point.id)) uniquePoints.set(point.id, point);
                    });
                    reportInfrastructure = Array.from(uniquePoints.values());
                } catch (infraErr) {
                    console.warn("Error auto-fetching infra para reporte:", infraErr);
                }
            }

            generatePDFReport(sedesWithStatus, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg, reportInfrastructure, affectedColaboradores, options);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Error general al generar el reporte: " + error.message);
        }
    };

    return { handleGenerateReport };
};

export default useReporting;
