import { useState, useEffect, useRef, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { getEventos } from '../services/eventoService';
import { fetchColaboradores } from '../services/colaboradoresService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#65a30d'];

// Genera la lista de todos los meses disponibles desde los eventos
const getAllMonths = (eventos) => {
    const monthSet = new Set();
    eventos.forEach(ev => {
        const d = new Date(ev.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(key);
    });
    return Array.from(monthSet).sort();
};

const fmtMonthLabel = (key) => {
    const [year, month] = key.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleString('es', { month: 'short', year: 'numeric' });
};

const MetricCard = ({ icon, label, value, color = '#2563eb', subtext }) => (
    <div style={{
        background: 'white', borderRadius: '12px', padding: '18px',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <span style={{ fontSize: '1.9rem', fontWeight: 800, color }}>{value}</span>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
        {subtext && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{subtext}</span>}
    </div>
);

const SectionTitle = ({ title, subtitle }) => (
    <div style={{ marginBottom: '12px', marginTop: '28px' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{subtitle}</p>}
    </div>
);

const MetricsDashboard = () => {
    const [eventos, setEventos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Control de meses seleccionados para filtrar
    const [allMonths, setAllMonths] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState(new Set());
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    const dashboardRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ev, col] = await Promise.all([getEventos(), fetchColaboradores()]);
                const evList = ev || [];
                setEventos(evList);
                setColaboradores(col || []);

                // Inicializar con los últimos 12 meses seleccionados
                const months = getAllMonths(evList);
                setAllMonths(months);
                const last12 = months.slice(-12);
                setSelectedMonths(new Set(last12));
            } catch (e) {
                console.error('Error cargando métricas:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleMonth = useCallback((key) => {
        setSelectedMonths(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const selectAll = () => setSelectedMonths(new Set(allMonths));
    const selectLast12 = () => setSelectedMonths(new Set(allMonths.slice(-12)));
    const selectLast6 = () => setSelectedMonths(new Set(allMonths.slice(-6)));
    const selectLast3 = () => setSelectedMonths(new Set(allMonths.slice(-3)));

    // Filtrar eventos según los meses seleccionados
    const eventosFiltrados = eventos.filter(ev => {
        const d = new Date(ev.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return selectedMonths.has(key);
    });

    // ── Cálculos de métricas ─────────────────────────────────────────────────

    // Eventos por mes (solo los seleccionados, ordenados)
    const eventosPorMes = {};
    eventosFiltrados.forEach(ev => {
        const d = new Date(ev.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        eventosPorMes[key] = (eventosPorMes[key] || 0) + 1;
    });
    const eventosData = Array.from(selectedMonths)
        .sort()
        .map(key => ({ mes: fmtMonthLabel(key), total: eventosPorMes[key] || 0 }));

    // Eventos por tipo
    const eventosPorTipo = {};
    eventosFiltrados.forEach(ev => {
        eventosPorTipo[ev.tipo] = (eventosPorTipo[ev.tipo] || 0) + 1;
    });
    const tipoData = Object.entries(eventosPorTipo)
        .map(([tipo, value], i) => ({ name: tipo, value, color: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.value - a.value).slice(0, 7);

    // Nivel de alerta
    const nivelData = [
        { name: 'Verde', value: eventosFiltrados.filter(e => e.nivel_alerta === 'verde').length, color: '#22c55e' },
        { name: 'Amarillo', value: eventosFiltrados.filter(e => e.nivel_alerta === 'amarillo').length, color: '#eab308' },
        { name: 'Naranja', value: eventosFiltrados.filter(e => e.nivel_alerta === 'naranja').length, color: '#f97316' },
        { name: 'Rojo', value: eventosFiltrados.filter(e => e.nivel_alerta === 'rojo').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Colaboradores (no dependen del filtro de meses)
    const totalCol = colaboradores.length;
    const geoReferenciados = colaboradores.filter(c => c.latitud && c.longitud).length;
    const pctGeo = totalCol ? Math.round((geoReferenciados / totalCol) * 100) : 0;
    const conContacto = colaboradores.filter(c => c.contacto_emergencia_nombre).length;
    const pctContacto = totalCol ? Math.round((conContacto / totalCol) * 100) : 0;

    const porGerencia = {};
    colaboradores.forEach(c => {
        const g = c.gerencia || 'Sin gerencia';
        porGerencia[g] = (porGerencia[g] || 0) + 1;
    });
    const gerenciaData = Object.entries(porGerencia)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total).slice(0, 8);

    const porModalidad = {};
    colaboradores.forEach(c => {
        porModalidad[c.modalidad || 'Sin info'] = (porModalidad[c.modalidad || 'Sin info'] || 0) + 1;
    });
    const modalidadData = Object.entries(porModalidad)
        .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

    // ── Exportar PDF ─────────────────────────────────────────────────────────
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const periodoLabel = Array.from(selectedMonths).sort()
            .map(fmtMonthLabel).join(', ') || 'Sin filtro';

        // Encabezado
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SGCN — Dashboard de Métricas', 14, 13);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${periodoLabel}`, 14, 21);
        doc.text(`Generado: ${new Date().toLocaleString('es')}`, 14, 26);

        let y = 38;

        // KPIs
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Indicadores clave', 14, y);
        y += 6;

        const kpis = [
            ['Eventos en el período', eventosFiltrados.length],
            ['Colaboradores totales', totalCol],
            ['Georreferenciados', `${pctGeo}% (${geoReferenciados})`],
            ['Con contacto emergencia', `${pctContacto}% (${conContacto})`],
            ['Eventos nivel Rojo', eventosFiltrados.filter(e => e.nivel_alerta === 'rojo').length],
        ];

        autoTable(doc, {
            startY: y,
            head: [['Indicador', 'Valor']],
            body: kpis,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
            margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;

        // Eventos por mes
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Eventos por mes', 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Mes', 'Cantidad de eventos']],
            body: eventosData.map(d => [d.mes, d.total]),
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
            margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;

        // Eventos por tipo
        if (tipoData.length > 0) {
            if (y > 220) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Eventos por tipo', 14, y);
            y += 4;
            autoTable(doc, {
                startY: y,
                head: [['Tipo de evento', 'Cantidad']],
                body: tipoData.map(d => [d.name, d.value]),
                theme: 'striped',
                headStyles: { fillColor: [124, 58, 237] },
                margin: { left: 14, right: 14 },
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // Colaboradores por gerencia
        if (gerenciaData.length > 0) {
            if (y > 220) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Colaboradores por gerencia', 14, y);
            y += 4;
            autoTable(doc, {
                startY: y,
                head: [['Gerencia', 'Colaboradores']],
                body: gerenciaData.map(d => [d.name, d.total]),
                theme: 'striped',
                headStyles: { fillColor: [5, 150, 105] },
                margin: { left: 14, right: 14 },
            });
        }

        // Pie de página
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount} — SGCN v2.5`, 105, 290, { align: 'center' });
        }

        doc.save(`SGCN_Metricas_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            📊 Cargando métricas...
        </div>
    );

    return (
        <div ref={dashboardRef} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header con título y botones */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                        📊 Dashboard de Métricas
                    </h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
                        Resumen ejecutivo · {selectedMonths.size} mes(es) seleccionado(s) · {eventosFiltrados.length} eventos en el período
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Accesos rápidos de filtro */}
                    {[
                        { label: 'Último mes', fn: () => setSelectedMonths(new Set(allMonths.slice(-1))) },
                        { label: '3 meses', fn: selectLast3 },
                        { label: '6 meses', fn: selectLast6 },
                        { label: '12 meses', fn: selectLast12 },
                        { label: 'Todo', fn: selectAll },
                    ].map(({ label, fn }) => (
                        <button key={label} onClick={fn} style={{
                            padding: '5px 11px', fontSize: '0.78rem', border: '1px solid #e2e8f0',
                            borderRadius: '20px', cursor: 'pointer', background: 'white',
                            color: '#475569', fontWeight: 600
                        }}>
                            {label}
                        </button>
                    ))}

                    {/* Selector manual de meses */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            style={{
                                padding: '5px 11px', fontSize: '0.78rem', background: '#f1f5f9',
                                border: '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer',
                                color: '#334155', fontWeight: 600
                            }}
                        >
                            📅 Elegir meses {showMonthPicker ? '▲' : '▼'}
                        </button>
                        {showMonthPicker && (
                            <div style={{
                                position: 'absolute', top: '34px', right: 0, zIndex: 999,
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '12px',
                                minWidth: '200px', maxHeight: '300px', overflowY: 'auto'
                            }}>
                                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                    Selecciona los meses a incluir:
                                </p>
                                {allMonths.length === 0 && (
                                    <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Sin datos registrados aún</p>
                                )}
                                {allMonths.map(key => (
                                    <label key={key} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '5px 0', cursor: 'pointer', fontSize: '0.83rem',
                                        color: '#334155'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMonths.has(key)}
                                            onChange={() => toggleMonth(key)}
                                            style={{ accentColor: '#2563eb' }}
                                        />
                                        {fmtMonthLabel(key)}
                                        <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.75rem' }}>
                                            ({eventosPorMes[key] || 0} ev.)
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Descargar PDF */}
                    <button onClick={exportPDF} style={{
                        padding: '6px 14px', fontSize: '0.82rem',
                        background: '#2563eb', color: 'white',
                        border: 'none', borderRadius: '20px', cursor: 'pointer',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                        ⬇️ Descargar PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '4px' }}>
                <MetricCard icon="🏢" label="Eventos en el período" value={eventosFiltrados.length} color="#2563eb" />
                <MetricCard icon="👥" label="Colaboradores totales" value={totalCol} color="#7c3aed" />
                <MetricCard icon="📍" label="Georreferenciados" value={`${pctGeo}%`} color="#059669" subtext={`${geoReferenciados} de ${totalCol}`} />
                <MetricCard icon="🆘" label="Con contacto emergencia" value={`${pctContacto}%`} color="#d97706" subtext={`${conContacto} de ${totalCol}`} />
                <MetricCard icon="🔴" label="Eventos nivel Rojo" value={eventosFiltrados.filter(e => e.nivel_alerta === 'rojo').length} color="#dc2626" />
            </div>

            {/* Eventos por mes */}
            <SectionTitle title="Eventos por mes" subtitle="Según el período seleccionado. Los datos se acumulan automáticamente — nunca se borran." />
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                {eventosData.every(d => d.total === 0) ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>Sin eventos en el período seleccionado</p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={eventosData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="total" name="Eventos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Por tipo y nivel */}
            <SectionTitle title="Tipo de evento y nivel de alerta" subtitle="Del período seleccionado" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Por tipo de evento</h4>
                    {tipoData.length === 0
                        ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0', fontSize: '0.82rem' }}>Sin datos en el período</p>
                        : <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                                <Pie data={tipoData} cx="50%" cy="50%" outerRadius={72} dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                                    {tipoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Por nivel de alerta</h4>
                    {nivelData.length === 0
                        ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0', fontSize: '0.82rem' }}>Sin datos en el período</p>
                        : <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                                <Pie data={nivelData} cx="50%" cy="50%" outerRadius={72} dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                                    {nivelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            {/* Gerencia */}
            <SectionTitle title="Colaboradores por gerencia" subtitle="Top 8 — total en la BD (independiente del filtro de meses)" />
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={gerenciaData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total" name="Colaboradores" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Modalidad */}
            <SectionTitle title="Colaboradores por modalidad" />
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={modalidadData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Colaboradores" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {modalidadData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsDashboard;
