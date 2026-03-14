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
            // Captura del Mapa
            const mapElement = document.getElementById('map-capture');
            let mapImg = null;
            if (mapElement) {
                window.scrollTo(0, 0);
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    const canvas = await html2canvas(mapElement, {
                        useCORS: true,
                        allowTaint: false,
                        logging: false,
                        backgroundColor: '#ffffff',
                        scale: 2,
                        onclone: (clonedDoc) => {
                            // Sanitización para PDF
                            const styles = clonedDoc.getElementsByTagName('style');
                            for (let s of styles) {
                                if (s.innerHTML.includes('oklch') || s.innerHTML.includes('oklab')) {
                                    s.disabled = true;
                                    s.remove();
                                }
                            }
                            clonedDoc.querySelectorAll('*').forEach(el => {
                                const s = el.getAttribute('style');
                                if (s && (s.includes('oklch') || s.includes('oklab'))) {
                                    el.setAttribute('style', s.replace(/oklch\([^)]+\)/g, '#3b82f6').replace(/oklab\([^)]+\)/g, '#3b82f6'));
                                }
                            });
                        },
                        ignoreElements: (node) => {
                            if (!node || !node.classList) return false;
                            return (
                                node.classList.contains('leaflet-control-container') ||
                                node.classList.contains('leaflet-draw-toolbar') ||
                                node.id === 'search-control'
                            );
                        }
                    });

                    if (canvas) {
                        mapImg = canvas.toDataURL('image/png');
                    }
                } catch (mapErr) {
                    console.error("Error capturando Mapa:", mapErr);
                }
            }

            // Captura de Gráficas
            let chartsImg = null;
            const chartsElement = document.getElementById('charts-capture-hidden');
            if (chartsElement) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 3500));
                    chartsImg = await toPng(chartsElement, {
                        backgroundColor: '#ffffff',
                        quality: 1,
                        pixelRatio: 2,
                    });
                } catch (chartErr) {
                    console.error("Error capturando gráficas:", chartErr);
                }
            }

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
