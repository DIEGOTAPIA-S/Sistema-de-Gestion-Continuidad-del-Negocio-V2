import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardCharts = ({ sedes }) => {
    // 1. Calculate Metrics
    const totalSedes = sedes.length;
    const affectedSedes = sedes.filter(s => s.status === 'affected' || s.status === 'nearby');
    const affectedCount = affectedSedes.length;
    const criticalAffectedCount = affectedSedes.filter(s => s.procesos && s.procesos.some(p => p.criticidad === 'Crítica')).length;

    // 2. Data for Bar Chart: Total vs Directa vs Cercana by City
    const cityMap = {};
    sedes.forEach(s => {
        if (!cityMap[s.ciudad]) cityMap[s.ciudad] = { name: s.ciudad, Total: 0, Directa: 0, Cercana: 0 };
        cityMap[s.ciudad].Total += 1;
        if (s.status === 'affected') {
            cityMap[s.ciudad].Directa += 1;
        } else if (s.status === 'nearby') {
            cityMap[s.ciudad].Cercana += 1;
        }
    });
    const cityData = Object.values(cityMap);

    // 3. Data for Pie Chart: Criticality of AFFECTED Sedes only
    const criticalityCounts = { 'Crítica': 0, 'Alta': 0, 'Media': 0, 'Baja': 0 };
    affectedSedes.forEach(sede => {
        // Assume simplest logic: take max criticality of sede
        let maxCrit = 'Baja';
        if (sede.procesos && sede.procesos.length > 0) {
            const crits = sede.procesos.map(p => p.criticidad);
            if (crits.includes('Crítica')) maxCrit = 'Crítica';
            else if (crits.includes('Alta')) maxCrit = 'Alta';
            else if (crits.includes('Media')) maxCrit = 'Media';
        }
        criticalityCounts[maxCrit]++;
    });

    const pieData = [
        { name: 'Crítica', value: criticalityCounts['Crítica'], color: '#ef4444' },
        { name: 'Alta', value: criticalityCounts['Alta'], color: '#f97316' },
        { name: 'Media', value: criticalityCounts['Media'], color: '#eab308' },
        { name: 'Baja', value: criticalityCounts['Baja'], color: '#3b82f6' },
    ].filter(d => d.value > 0);

    return (
        <div style={{ padding: '0' }}>
            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '15px' }}>
                    <h4 style={{ margin: '0', color: '#64748b' }}>Sedes Totales</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{totalSedes}</span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '15px', borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ margin: '0', color: '#ef4444' }}>Afectación Directa</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{sedes.filter(s => s.status === 'affected').length}</span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '15px', borderLeft: '4px solid #f59e0b' }}>
                    <h4 style={{ margin: '0', color: '#f59e0b' }}>Sedes Cercanas</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{sedes.filter(s => s.status === 'nearby').length}</span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '15px', borderLeft: '4px solid #f97316' }}>
                    <h4 style={{ margin: '0', color: '#f97316' }}>Impacto Crítico</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>{criticalAffectedCount}</span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>(Procesos Críticos)</div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                {/* Bar Chart */}
                <div className="card">
                    <h3>Impacto por Ciudad (Detallado)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Total" fill="#e2e8f0" name="Total Sedes" />
                                <Bar dataKey="Directa" fill="#ef4444" name="Directa" />
                                <Bar dataKey="Cercana" fill="#f59e0b" name="Cercana" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="card">
                    <h3>Criticidad (Solo Afectadas)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
