
const EventRegistrationPanel = ({ eventDetails, onChange, onSave }) => {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📝 Registro de Evento
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', alignItems: 'start' }}>
                {/* Columna 1: Tipo y Botón */}
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

                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                        1. Seleccione el tipo.<br />
                        2. Describa los detalles.<br />
                        3. Use el mapa para dibujar zonas.<br />
                        4. Guardar.
                    </p>

                    <button
                        onClick={onSave}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: 'auto'
                        }}
                    >
                        💾 Guardar Evento
                    </button>
                </div>

                {/* Columna 2: Descripción (Full Height) */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Descripción Detallada</label>
                    <textarea
                        name="description"
                        value={eventDetails.description}
                        onChange={onChange}
                        rows="6"
                        placeholder="Describa el evento con detalle (hora, gravedad, afectaciones específicas)..."
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventRegistrationPanel;
