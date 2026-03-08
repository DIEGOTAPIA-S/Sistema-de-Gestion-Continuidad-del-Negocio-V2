import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getEventos } from '../services/eventoService';
import { fetchColaboradores } from '../services/colaboradoresService';

// Paleta de colores armoniosa
const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#65a30d'];

// Formatea mes/año desde un Date
const fmtMonth = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleString('es', { month: 'short' })} ${d.getFullYear()}`;
};

const MetricCard = ({ icon, label, value, color = '#2563eb', subtext }) => (
    <div style={{
        background: 'white', borderRadius: '12px',
        padding: '20px', borderLeft: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column', gap: '6px'
    }}>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
        <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</span>
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
        {subtext && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext}</span>}
    </div>
);

const MetricsDashboard = () => {
    const [eventos, setEventos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ev, col] = await Promise.all([getEventos(), fetchColaboradores()]);
                setEventos(ev || []);
                setColaboradores(col || []);
            } catch (e) {
                console.error('Error cargando métricas:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            📊 Cargando métricas...
        </div>
    );

    // ── 1. EVENTOS POR MES ──────────────────────────────────────────────────
    const eventosPorMes = {};
    eventos.forEach(ev => {
        const mes = fmtMonth(ev.fecha);
        if (!eventosPorMes[mes]) eventosPorMes[mes] = 0;
        eventosPorMes[mes]++;
    });
    const eventosData = Object.entries(eventosPorMes)
        .slice(-12) // Últimos 12 meses
        .map(([mes, total]) => ({ mes, total }));

    // ── 2. EVENTOS POR TIPO ──────────────────────────────────────────────────
    const eventosPorTipo = {};
    eventos.forEach(ev => {
        eventosPorTipo[ev.tipo] = (eventosPorTipo[ev.tipo] || 0) + 1;
    });
    const tipoData = Object.entries(eventosPorTipo)
        .map(([tipo, value], i) => ({ name: tipo, value, color: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7);

    // ── 3. COLABORADORES POR MODALIDAD ───────────────────────────────────────
    const porModalidad = {};
    colaboradores.forEach(c => {
        const m = c.modalidad || 'Sin info';
        porModalidad[m] = (porModalidad[m] || 0) + 1;
    });
    const modalidadData = Object.entries(porModalidad).map(([name, value], i) => ({
        name, value, color: COLORS[i % COLORS.length]
    }));

    // ── 4. COLABORADORES POR GERENCIA (top 8) ────────────────────────────────
    const porGerencia = {};
    colaboradores.forEach(c => {
        const g = c.gerencia || 'Sin gerencia';
        porGerencia[g] = (porGerencia[g] || 0) + 1;
    });
    const gerenciaData = Object.entries(porGerencia)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    // ── 5. % COBERTURA GEORREFERENCIADA ─────────────────────────────────────
    const geoReferenciados = colaboradores.filter(c => c.latitud && c.longitud).length;
    const totalCol = colaboradores.length;
    const pctGeo = totalCol ? Math.round((geoReferenciados / totalCol) * 100) : 0;

    // ── 6. CONTACTO DE EMERGENCIA REGISTRADO ─────────────────────────────────
    const conContacto = colaboradores.filter(c => c.contacto_emergencia_nombre).length;
    const pctContacto = totalCol ? Math.round((conContacto / totalCol) * 100) : 0;

    // ── 7. NIVEL DE ALERTA DE EVENTOS ───────────────────────────────────────
    const nivelData = [
        { name: 'Verde', value: eventos.filter(e => e.nivel_alerta === 'verde').length, color: '#22c55e' },
        { name: 'Amarillo', value: eventos.filter(e => e.nivel_alerta === 'amarillo').length, color: '#eab308' },
        { name: 'Naranja', value: eventos.filter(e => e.nivel_alerta === 'naranja').length, color: '#f97316' },
        { name: 'Rojo', value: eventos.filter(e => e.nivel_alerta === 'rojo').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const sectionTitle = (title, subtitle) => (
        <div style={{ marginBottom: '16px', marginTop: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{subtitle}</p>}
        </div>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                📊 Dashboard de Métricas
            </h2>
            <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Resumen ejecutivo del Sistema de Gestión de Continuidad del Negocio
            </p>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '8px' }}>
                <MetricCard icon="🏢" label="Eventos registrados" value={eventos.length} color="#2563eb" />
                <MetricCard icon="👥" label="Colaboradores totales" value={totalCol} color="#7c3aed" />
                <MetricCard icon="📍" label="Georreferenciados" value={`${pctGeo}%`} color="#059669"
                    subtext={`${geoReferenciados} de ${totalCol}`} />
                <MetricCard icon="🆘" label="Con contacto emergencia" value={`${pctContacto}%`} color="#d97706"
                    subtext={`${conContacto} de ${totalCol}`} />
                <MetricCard icon="🔴" label="Eventos nivel Rojo" value={eventos.filter(e => e.nivel_alerta === 'rojo').length} color="#dc2626" />
            </div>

            {/* ── Eventos por mes ── */}
            {sectionTitle('Eventos por mes', 'Últimos 12 meses registrados')}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                {eventosData.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>Sin eventos registrados aún</p>
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

            {/* ── Eventos por tipo + Nivel alerta ── */}
            {sectionTitle('Eventos por tipo y nivel de alerta')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Por tipo de evento</h4>
                    {tipoData.length === 0
                        ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem' }}>Sin datos</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={tipoData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                                    {tipoData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Por nivel de alerta</h4>
                    {nivelData.length === 0
                        ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem' }}>Sin datos</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={nivelData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                                    {nivelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            {/* ── Colaboradores por gerencia ── */}
            {sectionTitle('Colaboradores por gerencia', 'Top 8 gerencias con más colaboradores registrados')}
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

            {/* ── Modalidad ── */}
            {sectionTitle('Colaboradores por modalidad de trabajo')}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={modalidadData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Colaboradores" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {modalidadData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsDashboard;
