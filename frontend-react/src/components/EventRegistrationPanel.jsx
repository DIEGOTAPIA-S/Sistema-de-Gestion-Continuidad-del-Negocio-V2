
const NIVELES = [
    { value: 'verde', label: '🟢 Verde — Sin impacto significativo', bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
    { value: 'amarillo', label: '🟡 Amarillo — Impacto moderado / Monitorear', bg: '#fef9c3', border: '#eab308', text: '#854d0e' },
    { value: 'naranja', label: '🟠 Naranja — Impacto alto / Activar planes', bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
    { value: 'rojo', label: '🔴 Rojo — Crítico / Continuidad afectada', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
];

const EventRegistrationPanel = ({ eventDetails, onChange, onSave }) => {
    const nivelActual = NIVELES.find(n => n.value === (eventDetails.nivel_alerta || 'verde'));

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📝 Registro de Evento
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', alignItems: 'start' }}>
                {/* Columna 1: Tipo, Nivel y Botón */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Tipo de Evento</label>
                        <select
                            name="type"
                            value={eventDetails.type}
                            onChange={onChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                        >
                            <option value="Servicios Públicos">💡 Interrupción Servicios Públicos</option>
                            <option value="Manifestación">📢 Manifestación Social</option>
                            <option value="Bloqueo Vial">🛑 Bloqueo Vial o Movilidad</option>
                            <option value="Físico Ambiental">🌪️ Físico-Ambiental (Incendios, Inundaciones)</option>
                            <option value="Terrorismo">💣 Acto de Terrorismo</option>
                            <option value="Incidente Operativo">⚙️ Incidente Operativo</option>
                            <option value="Otro">❓ Otro</option>
                        </select>
                    </div>

                    {/* Nivel de Alerta — NUEVO */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                            Nivel de Alerta
                        </label>

                        {/* Indicador visual del nivel seleccionado */}
                        <div style={{
                            background: nivelActual.bg, border: `2px solid ${nivelActual.border}`,
                            borderRadius: '8px', padding: '8px 12px', marginBottom: '8px',
                            color: nivelActual.text, fontWeight: 700, fontSize: '0.85rem'
                        }}>
                            {nivelActual.label}
                        </div>

                        {/* Botones de selección rápida */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {NIVELES.map(n => (
                                <button
                                    key={n.value}
                                    type="button"
                                    onClick={() => onChange({ target: { name: 'nivel_alerta', value: n.value } })}
                                    style={{
                                        padding: '7px 6px', borderRadius: '6px', cursor: 'pointer',
                                        fontSize: '0.78rem', fontWeight: 600,
                                        border: eventDetails.nivel_alerta === n.value
                                            ? `2px solid ${n.border}`
                                            : '2px solid #e2e8f0',
                                        background: eventDetails.nivel_alerta === n.value ? n.bg : 'white',
                                        color: eventDetails.nivel_alerta === n.value ? n.text : '#64748b',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {n.value === 'verde' ? '🟢' : n.value === 'amarillo' ? '🟡' : n.value === 'naranja' ? '🟠' : '🔴'} {n.value.charAt(0).toUpperCase() + n.value.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                        1. Seleccione el tipo.<br />
                        2. Defina el nivel de alerta.<br />
                        3. Describa los detalles.<br />
                        4. Dibuje zonas en el mapa.<br />
                        5. Guardar.
                    </p>

                    <button
                        onClick={onSave}
                        style={{
                            background: '#0f172a', color: 'white', border: 'none',
                            padding: '12px', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', marginTop: 'auto'
                        }}
                    >
                        💾 Guardar Evento
                    </button>
                </div>

                {/* Columna 2: Descripción */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Descripción Detallada</label>
                    <textarea
                        name="description"
                        value={eventDetails.description}
                        onChange={onChange}
                        rows="8"
                        placeholder="Describa el evento con detalle (hora, gravedad, afectaciones específicas)..."
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventRegistrationPanel;
