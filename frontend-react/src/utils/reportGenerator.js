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
            try {
                doc.setFontSize(12);
                doc.setTextColor(15, 23, 42);
                doc.text("Mapa del Evento", 14, currentY);
                currentY += 5;

                const mapHeight = 80;
                const mapWidth = pageWidth - 28;
                
                // Usamos 'JPEG' o 'auto' para ser más tolerantes con la firma de la imagen
                // 'FAST' mejora el rendimiento de compresión
                doc.addImage(mapImg, 'JPEG', 14, currentY, mapWidth, mapHeight, undefined, 'FAST');
                currentY += mapHeight + 10;
            } catch (imgErr) {
                console.warn("Error insertando imagen del mapa en PDF:", imgErr);
                doc.setFontSize(10);
                doc.setTextColor(239, 68, 68);
                doc.text("[Error al renderizar la imagen del mapa]", 14, currentY);
                currentY += 10;
            }
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

        // --- Estadísticas de Impacto (Native jsPDF Drawing - 100% reliable) ---
        if (currentY + 60 > 280) { doc.addPage(); currentY = 20; }

        const totalSedesCount = Array.isArray(allSedes) ? allSedes.length : 0;
        const affCountStats = Array.isArray(affectedSedes) ? affectedSedes.length : 0;
        const nearCountStats = Array.isArray(nearbySedes) ? nearbySedes.length : 0;
        const allAffected = [...(affectedSedes || []), ...(nearbySedes || [])];
        const critImpact = allAffected.filter(s => s.procesos && s.procesos.some(p => p.criticidad === 'Crítica')).length;

        // Section title
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text("Estadísticas de Impacto", 14, currentY);
        currentY += 8;

        // Draw 4 metric cards
        const cardW = (pageWidth - 28) / 4 - 3;
        const metricCards = [
            { label: 'Sedes Totales', value: totalSedesCount, color: [30, 64, 175] },
            { label: 'Afectacion Directa', value: affCountStats, color: [220, 38, 38] },
            { label: 'Sedes Cercanas', value: nearCountStats, color: [217, 119, 6] },
            { label: 'Impacto Critico', value: critImpact, color: [234, 88, 12] },
        ];

        metricCards.forEach((card, i) => {
            const x = 14 + i * (cardW + 4);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(x, currentY, cardW, 22, 2, 2, 'F');
            doc.setFillColor(card.color[0], card.color[1], card.color[2]);
            doc.rect(x, currentY, 3, 22, 'F');
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + 6, currentY + 7);
            doc.setFontSize(16);
            doc.setTextColor(card.color[0], card.color[1], card.color[2]);
            doc.text(String(card.value), x + 6, currentY + 17);
        });
        currentY += 30;

        // ====================================================================
        // --- NATIVE BAR CHART: Impacto por Ciudad ---
        // ====================================================================
        const cityMapStats = {};
        [...(allSedes || [])].forEach(s => {
            const city = s.ciudad || 'Sin ciudad';
            if (!cityMapStats[city]) cityMapStats[city] = { total: 0, directa: 0, cercana: 0 };
            cityMapStats[city].total++;
            if (s.status === 'affected') cityMapStats[city].directa++;
            else if (s.status === 'nearby') cityMapStats[city].cercana++;
        });

        const cityEntries = Object.entries(cityMapStats).filter(([, v]) => v.directa > 0 || v.cercana > 0);

        // Criticality data
        const critCounts = { 'Critica': 0, 'Alta': 0, 'Media': 0, 'Baja': 0 };
        const critColors = { 'Critica': [220, 38, 38], 'Alta': [234, 88, 12], 'Media': [234, 179, 8], 'Baja': [59, 130, 246] };
        allAffected.forEach(sede => {
            let maxCrit = 'Baja';
            if (sede.procesos && sede.procesos.length > 0) {
                const crits = sede.procesos.map(p => p.criticidad);
                if (crits.includes('Crítica')) maxCrit = 'Critica';
                else if (crits.includes('Alta')) maxCrit = 'Alta';
                else if (crits.includes('Media')) maxCrit = 'Media';
            }
            critCounts[maxCrit]++;
        });

        if (currentY + 80 > 280) { doc.addPage(); currentY = 20; }

        // --- Chart Section Title ---
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("Gráficas de Impacto por Ciudad", 14, currentY);
        currentY += 6;

        // --- Bar Chart Layout ---
        const chartLeft = 28;           // X start (leaves space for Y labels)
        const chartTop = currentY;
        const chartWidth = 120;         // width of bar area in mm
        const chartHeight = 55;         // height in mm
        const chartBottom = chartTop + chartHeight;

        // Calculate max value for scaling
        const maxVal = Math.max(...(cityEntries.length > 0 ? cityEntries.map(([, v]) => v.total) : [1]), 1);

        // Draw chart background
        doc.setFillColor(248, 250, 252);
        doc.rect(chartLeft, chartTop, chartWidth, chartHeight, 'F');

        // Draw horizontal grid lines + Y-axis labels
        const gridLines = 4;
        doc.setFontSize(5.5);
        doc.setTextColor(148, 163, 184);
        for (let i = 0; i <= gridLines; i++) {
            const yPos = chartBottom - (i / gridLines) * chartHeight;
            const val = Math.round((i / gridLines) * maxVal);
            doc.setDrawColor(220, 220, 220);
            doc.line(chartLeft, yPos, chartLeft + chartWidth, yPos);
            doc.setTextColor(100, 116, 139);
            doc.text(String(val), chartLeft - 2, yPos + 1, { align: 'right' });
        }

        // Draw X and Y axes
        doc.setDrawColor(100, 116, 139);
        doc.line(chartLeft, chartTop, chartLeft, chartBottom);        // Y axis
        doc.line(chartLeft, chartBottom, chartLeft + chartWidth, chartBottom);  // X axis

        // Draw bars
        const numCities = cityEntries.length || 1;
        const groupW = chartWidth / numCities;
        const barW = Math.min(groupW * 0.22, 6); // each sub-bar width, max 6mm
        const barGap = 0.8;

        cityEntries.forEach(([city, v], i) => {
            const gx = chartLeft + i * groupW + groupW * 0.12;

            // Total bar (light gray)
            const tH = (v.total / maxVal) * chartHeight;
            doc.setFillColor(203, 213, 225);
            doc.rect(gx, chartBottom - tH, barW, tH, 'F');

            // Directa bar (red)
            const dH = (v.directa / maxVal) * chartHeight;
            doc.setFillColor(220, 38, 38);
            doc.rect(gx + barW + barGap, chartBottom - dH, barW, dH, 'F');

            // Cercana bar (orange)
            const cH = (v.cercana / maxVal) * chartHeight;
            doc.setFillColor(217, 119, 6);
            doc.rect(gx + (barW + barGap) * 2, chartBottom - cH, barW, cH, 'F');

            // City label on X axis
            doc.setFontSize(5.5);
            doc.setTextColor(71, 85, 105);
            const cityLabel = city.length > 9 ? city.substring(0, 8) + '.' : city;
            doc.text(cityLabel, gx + (barW * 1.5), chartBottom + 3.5, { align: 'center' });
        });

        // Bar chart legend (below)
        const legendY = chartBottom + 8;
        const legendItems = [
            { label: 'Total Sedes', color: [203, 213, 225] },
            { label: 'Afectacion Directa', color: [220, 38, 38] },
            { label: 'Sedes Cercanas', color: [217, 119, 6] },
        ];
        legendItems.forEach((item, i) => {
            const lx = chartLeft + i * 40;
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.rect(lx, legendY, 4, 3, 'F');
            doc.setFontSize(6);
            doc.setTextColor(71, 85, 105);
            doc.text(item.label, lx + 5.5, legendY + 2.5);
        });

        // --- Criticality Panel to the right of bar chart ---
        const critX = chartLeft + chartWidth + 8;
        const critPanelW = pageWidth - critX - 14;

        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("Criticidad", critX, chartTop + 4);

        const critEntries = Object.entries(critCounts).filter(([, v]) => v > 0);
        const totalAff = critEntries.reduce((sum, [, v]) => sum + v, 0) || 1;
        let critBarY = chartTop + 9;
        const critBarMaxW = critPanelW - 14;

        critEntries.forEach(([label, val]) => {
            const pct = val / totalAff;
            const barFill = pct * critBarMaxW;
            const col = critColors[label] || [100, 116, 139];

            // Label + count
            doc.setFontSize(7);
            doc.setTextColor(51, 65, 85);
            doc.text(`${label} (${val})`, critX, critBarY + 2.5);
            critBarY += 4.5;

            // Background bar
            doc.setFillColor(240, 240, 240);
            doc.rect(critX, critBarY, critBarMaxW, 4, 'F');

            // Filled bar
            doc.setFillColor(col[0], col[1], col[2]);
            doc.rect(critX, critBarY, barFill, 4, 'F');

            // Percentage label
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text(`${Math.round(pct * 100)}%`, critX + critBarMaxW + 1, critBarY + 3);

            critBarY += 8;
        });

        currentY = legendY + 12;



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

                    // Calculate distances and prioritize Official data
                    let localPoints = reportInfrastructure.map(p => ({
                        ...p,
                        dist: getDistance(parseFloat(sede.latitud), parseFloat(sede.longitud), p.lat, p.lon)
                    }));

                    // Sort: Official first (if within a reasonable distance), then by proximity
                    localPoints.sort((a, b) => {
                        if (a.isOfficial && !b.isOfficial) return -1;
                        if (!a.isOfficial && b.isOfficial) return 1;
                        return a.dist - b.dist;
                    });

                    const topPoints = localPoints.slice(0, 5);

                    const infraBody = topPoints.map(p => [
                        p.type === 'police' ? 'Policia' : (p.type === 'fire_station' ? 'Bomberos' : 'Salud'),
                        p.isOfficial ? `${p.name} (OFICIAL)` : p.name,
                        p.phone && p.phone !== 'No registrado' && p.phone !== 'Sin datos' ? p.phone : (p.telefono || 'Sin tel.'),
                        p.address || p.direccion ||  '-',
                        `${p.dist.toFixed(2)} km`
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [['Tipo', 'Nombre', 'Contacto', 'Dirección', 'Distancia']],
                        body: infraBody,
                        theme: 'striped',
                        headStyles: { fillColor: [75, 85, 99], textColor: 255 },
                        styles: { fontSize: 7 },
                        columnStyles: {
                            0: { fontStyle: 'bold', width: 25 },
                            1: { width: 45 },
                            2: { width: 30 },
                            3: { width: 30 },
                            4: { width: 25 }
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
                    p.phone && p.phone !== 'No registrado' && p.phone !== 'Sin datos' ? p.phone : (p.telefono || 'Sin tel.'),
                    p.address || p.direccion || '-'
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['Tipo', 'Nombre / Descripcion', 'Contacto', 'Dirección']],
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
