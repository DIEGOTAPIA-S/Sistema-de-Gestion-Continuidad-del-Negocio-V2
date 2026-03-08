export const downloadColaboradoresCSV = (colaboradores, filename = 'colaboradores_afectados.csv') => {
    if (!colaboradores || colaboradores.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Columnas ordenadas y con nombres claros para Excel
    // Incluye los nuevos campos: Contacto de Emergencia y Estado (Activo)
    const headers = [
        "Identificacion", "Nombres", "Apellidos", "Cargo", "Area", "Gerencia",
        "Modalidad", "Compañia", "Sede_Asignada", "Ciudad",
        "Direccion", "Telefono", "Email",
        "Contacto_Emergencia_Nombre", "Contacto_Emergencia_Telefono",
        "Activo"
    ];

    // Mapa de columna → campo en el objeto del colaborador
    const fieldMap = {
        "Identificacion": "identificacion",
        "Nombres": "nombres",
        "Apellidos": "apellidos",
        "Cargo": "cargo",
        "Area": "area",
        "Gerencia": "gerencia",
        "Modalidad": "modalidad",
        "Compañia": "compania",
        "Sede_Asignada": (c) => c.sede_nombre || '',
        "Ciudad": "ciudad",
        "Direccion": "direccion",
        "Telefono": "telefono",
        "Email": "email",
        "Contacto_Emergencia_Nombre": "contacto_emergencia_nombre",
        "Contacto_Emergencia_Telefono": "contacto_emergencia_telefono",
        "Activo": (c) => c.activo !== undefined ? (c.activo ? 'Sí' : 'No') : 'Sí',
    };

    const rows = colaboradores.map(c => {
        return headers.map(header => {
            const field = fieldMap[header];
            const val = typeof field === 'function' ? field(c) : (c[field] ?? '');
            const stringVal = String(val).replace(/"/g, '""');
            return `"${stringVal}"`;
        }).join(';');
    });

    // BOM UTF-8 para que Excel abra correctamente los caracteres especiales
    const csvContent = "\uFEFF" + headers.join(';') + "\n" + rows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

