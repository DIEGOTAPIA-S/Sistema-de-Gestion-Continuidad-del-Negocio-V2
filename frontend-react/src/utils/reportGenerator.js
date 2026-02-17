import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (allSedes, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg, infrastructurePoints) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- Header ---
        doc.setFillColor(37, 99, 235); // Medical Blue
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("Reporte de Continuidad de Negocio", 14, 16);

        // --- Metadata ---
        doc.setFontSize(9);
        doc.setTextColor(220, 230, 250);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, pageWidth - 14, 10, { align: 'right' });
        doc.text(`Generado por: ${user?.name || 'Sistema'}`, pageWidth - 14, 18, { align: 'right' });

        // --- Event Details ---
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text(`Evento: ${eventDetails?.type || 'No especificado'}`, 14, 35);

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const desc = eventDetails?.description || 'Sin descripción.';
        const splitDesc = doc.splitTextToSize(desc, pageWidth - 28);
        doc.text(splitDesc, 14, 42);

        let currentY = 42 + (splitDesc.length * 5) + 10;

        // --- Map Image ---
        if (mapImg) {
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("📍 Mapa del Evento", 14, currentY);
            currentY += 5;

            const mapHeight = 80; // Fixed height for map
            const mapWidth = pageWidth - 28;
            doc.addImage(mapImg, 'PNG', 14, currentY, mapWidth, mapHeight);
            currentY += mapHeight + 10;
        }

        // --- Stats Box ---
        const affCount = Array.isArray(affectedSedes) ? affectedSedes.length : 0;
        const nearCount = Array.isArray(nearbySedes) ? nearbySedes.length : 0;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, currentY, pageWidth - 28, 20, 'FD');
        doc.setTextColor(30);
        doc.setFontSize(10);
        doc.text(`Sedes Afectadas: ${affCount}`, 20, currentY + 13);
        doc.text(`Sedes Cercanas: ${nearCount}`, 80, currentY + 13);

        currentY += 25;

        // --- Charts Image ---
        if (chartsImg) {
            // Check if we need a new page for charts
            if (currentY + 80 > 280) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("📊 Estadísticas de Impacto", 14, currentY);
            currentY += 5;

            const chartHeight = 70;
            const chartWidth = pageWidth - 28;
            doc.addImage(chartsImg, 'PNG', 14, currentY, chartWidth, chartHeight);
            currentY += chartHeight + 10;
        }

        // --- Common Table Logic ---
        const renderTable = (title, sedes, headerColor) => {
            if (!Array.isArray(sedes) || sedes.length === 0) return;

            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 14, currentY);
            currentY += 4;

            const tableBody = [];

            sedes.forEach(s => {
                if (!s) return;

                // Safe access to properties
                const nombreSede = s.nombre || 'Sin nombre';
                const ciudadSede = s.ciudad || '-';

                if (Array.isArray(s.procesos) && s.procesos.length > 0) {
                    s.procesos.forEach(p => {
                        if (!p) return;
                        tableBody.push([
                            nombreSede,
                            ciudadSede,
                            p.nombre || 'Proceso genérico',
                            p.criticidad || '-',
                            p.rto ? `${p.rto}h` : '-',
                            p.rpo ? `${p.rpo}h` : '-'
                        ]);
                    });
                } else {
                    tableBody.push([nombreSede, ciudadSede, 'Sin procesos', '-', '-', '-']);
                }
            });

            if (tableBody.length === 0) return;

            autoTable(doc, {
                startY: currentY,
                head: [['Sede', 'Ciudad', 'Proceso', 'Criticidad', 'RTO', 'RPO']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: headerColor, textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                columnStyles: {
                    0: { fontStyle: 'bold', width: 40 },
                    2: { width: 50 },
                    5: { width: 20 }
                },
                didDrawPage: (data) => {
                    currentY = data.cursor.y + 10;
                }
            });

            currentY = doc.lastAutoTable.finalY + 15;

            if (currentY > 260) {
                doc.addPage();
                currentY = 20;
            }
        };

        // Render Tables
        renderTable('🚨 Sedes Afectadas (Zona Directa)', affectedSedes, [220, 38, 38]); // Red
        renderTable('⚠️ Sedes Cercanas (< 2km)', nearbySedes, [234, 88, 12]); // Orange

        // --- Infrastructure Table ---
        if (infrastructurePoints && infrastructurePoints.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("🚑 Infraestructura de Apoyo Identificada", 14, currentY);
            currentY += 5;

            const infraBody = infrastructurePoints.map(p => [
                p.type === 'police' ? 'Policía' : (p.type === 'fire_station' ? 'Bomberos' : 'Salud'),
                p.name,
                `${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['Tipo', 'Nombre / Descripción', 'Ubicación']],
                body: infraBody,
                theme: 'striped',
                headStyles: { fillColor: [75, 85, 99], textColor: 255 }, // Gray
                styles: { fontSize: 8 },
                columnStyles: { 0: { fontStyle: 'bold', width: 30 } }
            });
        }

        doc.save(`Reporte_Continuidad_${new Date().getTime()}.pdf`);

    } catch (err) {
        console.warn("Error PDF Generator:", err);
        alert("Ocurrió un error al generar el PDF: " + err.message);
    }
};
