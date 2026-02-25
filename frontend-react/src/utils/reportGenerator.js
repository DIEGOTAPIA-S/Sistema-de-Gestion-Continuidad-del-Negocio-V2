import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (allSedes, affectedSedes, nearbySedes, eventDetails, user, mapImg, chartsImg, infrastructurePoints, affectedColaboradores = [], options = {}) => {
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
            doc.text("Mapa del Evento", 14, currentY);
            currentY += 5;

            const mapHeight = 80; // Fixed height for map
            const mapWidth = pageWidth - 28;
            doc.addImage(mapImg, 'PNG', 14, currentY, mapWidth, mapHeight);
            currentY += mapHeight + 10;
        }

        // --- Stats Table (Impact Summary) ---
        const affCount = Array.isArray(affectedSedes) ? affectedSedes.length : 0;
        const nearCount = Array.isArray(nearbySedes) ? nearbySedes.length : 0;
        const colabCount = Array.isArray(affectedColaboradores) ? affectedColaboradores.length : 0;
        const presencial = affectedColaboradores.filter(c => c.modalidad !== 'Remoto').length;
        const remoto = affectedColaboradores.filter(c => c.modalidad === 'Remoto').length;

        autoTable(doc, {
            startY: currentY,
            head: [['Resumen de Impacto', 'Cantidad / Detalle']],
            body: [
                ['Sedes Afectadas (Zona Directa)', affCount],
                ['Sedes Cercanas (Radio 2km)', nearCount],
                ['Colaboradores en Zona de Riesgo', `${colabCount} (Presencial: ${presencial}, Remoto: ${remoto})`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85], textColor: 255 }, // Slate-700
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
        });

        currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 15;

        // --- Human Talent Table (Optional) ---
        if (options.includeColaboradoresList && colabCount > 0) {
            if (currentY + 60 > 280) { doc.addPage(); currentY = 20; }

            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("Detalle de Colaboradores Afectados", 14, currentY);
            currentY += 5;

            const colabBody = affectedColaboradores.map(c => [
                (c.nombres || '') + ' ' + (c.apellidos || ''),
                c.cargo || '',
                c.area || '',
                c.sede_nombre || 'N/A',
                c.ciudad || '-',
                c.email || 'No registrado'
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['Nombre', 'Cargo', 'Area', 'Sede', 'Ciudad', 'Email']],
                body: colabBody,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // Blue
                styles: { fontSize: 8 },
                didDrawPage: (data) => { currentY = data.cursor.y + 10; }
            });
            currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 10;
        }

        // --- Charts Image ---
        if (chartsImg) {
            if (currentY + 80 > 280) { doc.addPage(); currentY = 20; }

            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("Estadisticas de Impacto", 14, currentY);
            currentY += 5;

            const chartHeight = 70;
            const chartWidth = pageWidth - 28;
            doc.addImage(chartsImg, 'PNG', 14, currentY, chartWidth, chartHeight);
            currentY += chartHeight + 15;
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
                const nombreSede = s.nombre || 'Sin nombre';
                const ciudadSede = s.ciudad || '-';
                const procesos = Array.isArray(s.procesos) && s.procesos.length > 0 ? s.procesos : [{ nombre: 'Sin procesos', criticidad: '-', rto: '-', rpo: '-' }];

                procesos.forEach((p, idx) => {
                    const row = [];
                    // Apply RowSpan to Sede and Ciudad columns on first process
                    if (idx === 0) {
                        row.push({ content: nombreSede, rowSpan: procesos.length, styles: { fontStyle: 'bold', valign: 'middle' } });
                        row.push({ content: ciudadSede, rowSpan: procesos.length, styles: { valign: 'middle' } });
                    }

                    row.push(p.nombre || 'Proceso genérico');
                    row.push(p.criticality || p.criticidad || '-');
                    row.push(p.rto ? `${p.rto}h` : '-');
                    row.push(p.mtpd || p.rpo || '-');

                    tableBody.push(row);
                });
            });

            if (tableBody.length === 0) return;

            autoTable(doc, {
                startY: currentY,
                head: [['Sede', 'Ciudad', 'Proceso', 'Criticidad', 'RTO', 'MTPD']],
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

            currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 15;

            if (currentY > 260) {
                doc.addPage();
                currentY = 20;
            }
        };

        // Render Tables
        renderTable('Sedes Afectadas (Zona Directa)', affectedSedes, [220, 38, 38]); // Red
        renderTable('Sedes Cercanas (< 2km)', nearbySedes, [234, 88, 12]); // Orange

        // --- Red de Apoyo Table (Grouped by Sede) ---
        const reportInfrastructure = infrastructurePoints;

        if (reportInfrastructure && reportInfrastructure.length > 0) {

            // Determine target sedes (Affected or Nearby)
            const targetSedes = (affectedSedes && affectedSedes.length > 0) ? affectedSedes : (nearbySedes || []);

            // Helper for distance
            const getDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371; // km
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            if (targetSedes.length > 0) {
                // Loop through each sede to show its specific context
                targetSedes.forEach((sede) => {
                    // Check if page break needed
                    if (currentY > 250) {
                        doc.addPage();
                        currentY = 20;
                    }

                    doc.setFontSize(11);
                    doc.setTextColor(30, 64, 175); // Blue-800
                    doc.text(`Red de apoyo cercana a: ${sede.nombre}`, 14, currentY);
                    currentY += 5;

                    // Calculate distances from THIS sede to all points
                    let localPoints = reportInfrastructure.map(p => ({
                        ...p,
                        dist: getDistance(parseFloat(sede.latitud), parseFloat(sede.longitud), p.lat, p.lon)
                    }));

                    // Sort and take top 5
                    localPoints.sort((a, b) => a.dist - b.dist);
                    const topPoints = localPoints.slice(0, 5);

                    const infraBody = topPoints.map(p => [
                        p.type === 'police' ? 'Policia' : (p.type === 'fire_station' ? 'Bomberos' : 'Salud'),
                        p.name,
                        p.phone || 'No registrado', // Phone Column
                        `${p.dist.toFixed(2)} km`
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [['Tipo', 'Nombre / Descripcion', 'Contacto', 'Distancia Aprox.']],
                        body: infraBody,
                        theme: 'striped',
                        headStyles: { fillColor: [75, 85, 99], textColor: 255 }, // Gray
                        styles: { fontSize: 8 },
                        columnStyles: {
                            0: { fontStyle: 'bold', width: 30 },
                            2: { width: 40 } // Width for Contact
                        },
                        didDrawPage: (data) => {
                            // This callback handles page breaks inside the table itself
                        }
                    });

                    currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 10;
                });
            } else {
                // Fallback if no specific sede context
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.text("Red de Apoyo Visible en el Mapa", 14, currentY);
                currentY += 5;

                const infraBody = reportInfrastructure.slice(0, 10).map(p => [
                    p.type === 'police' ? 'Policia' : (p.type === 'fire_station' ? 'Bomberos' : 'Salud'),
                    p.name,
                    p.phone || 'No registrado', // Phone Column
                    `${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['Tipo', 'Nombre / Descripcion', 'Contacto', 'Ubicacion']],
                    body: infraBody,
                    theme: 'striped',
                    headStyles: { fillColor: [75, 85, 99], textColor: 255 },
                    styles: { fontSize: 8 },
                    columnStyles: {
                        0: { fontStyle: 'bold', width: 30 },
                        2: { width: 40 }
                    }
                });
            }
        }

        // --- Emergency Directory (Fixed Numbers) ---
        if (currentY > 220) { doc.addPage(); currentY = 20; }

        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("Directorio de Emergencias (Nacional / Bogotá)", 14, currentY);
        currentY += 5;

        const emergencyData = [
            ['Emergencias Generales', '123', 'Atención inmediata 24/7'],
            ['Cruz Roja', '132', 'Atención prehospitalaria'],
            ['Defensa Civil', '144', 'Gestión del riesgo'],
            ['Bomberos', '119', 'Incendios y rescate'],
            ['Policía Nacional', '112', 'Seguridad ciudadana'],
            ['Línea de Salud (Bogotá)', '195', 'Información trámites y citas'],
            ['Gaula (Secuestro/Extorsión)', '165', 'Seguridad especializada']
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Servicio', 'Contacto (Marcación)', 'Descripción']],
            body: emergencyData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 }
        });

        doc.save(`Reporte_Continuidad_${new Date().getTime()}.pdf`);

    } catch (err) {
        console.warn("Error PDF Generator:", err);
        alert("Ocurrió un error al generar el PDF: " + err.message);
    }
};
