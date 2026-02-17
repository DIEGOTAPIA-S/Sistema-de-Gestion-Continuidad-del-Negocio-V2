export const downloadColaboradoresCSV = (colaboradores, filename = 'colaboradores_afectados.csv') => {
    if (!colaboradores || colaboradores.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // 1. Get all headers from the first object, or predefined list
    // Predefined is better for ordering and labels
    const headers = [
        "Identificacion", "Nombres", "Apellidos", "Cargo", "Area", "Gerencia",
        "Email", "Compañia", "Modalidad", "Sede_Asignada", "Direccion", "Ciudad", "Telefono"
    ];

    // 2. Map data rows
    const rows = colaboradores.map(c => {
        return headers.map(header => {
            // Handle specific field logic if needed
            let val = c[header.toLowerCase()] || c[header] || ''; // try lowercase first (api standard) then capitalized

            // Special cases mapping if API names differ significantly from headers
            if (header === "Sede_Asignada") val = c.sede_nombre || c.sede_asignada || '';
            if (header === "Compañia") val = c.compania || ''; // API is compania (no ñ) usually? Check serializer.

            // Escape quotes
            const stringVal = String(val).replace(/"/g, '""');
            return `"${stringVal}"`;
        }).join(';'); // Use semicolon for Excel in Spanish regions
    });

    // 3. Construct CSV Content with BOM for Excel UTF-8
    const csvContent = "\uFEFF" + headers.join(';') + "\n" + rows.join('\n');

    // 4. Create Blob and Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
