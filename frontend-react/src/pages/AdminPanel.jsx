import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, deleteUser, changePassword } from '../services/userService';
import { getSedes, createSede, updateSede, deleteSede } from '../services/sedeService';
import ProcessManagementModal from '../components/ProcessManagementModal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks for coordinate picking
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    // Users State
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'analista' });

    // Sedes State
    const [sedes, setSedes] = useState([]);
    const [editingSede, setEditingSede] = useState(null); // If null, creating new. If set, editing.
    const [sedeForm, setSedeForm] = useState({ nombre: '', ciudad: '', direccion: '', latitud: 4.6097, longitud: -74.0817 });
    const [mapCenter, setMapCenter] = useState([4.6097, -74.0817]);

    // Process Modal State
    const [managingProcessesSede, setManagingProcessesSede] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'users') {
            try { setUsers(await getUsers()); } catch (e) { console.error(e); }
        } else {
            try { setSedes(await getSedes()); } catch (e) { console.error(e); }
        }
    };

    // --- User Handlers ---
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUser);
            setNewUser({ username: '', password: '', role: 'analista' });
            loadData();
            alert("Usuario creado");
        } catch (e) { alert("Error creando usuario"); }
    };

    const handleChangePassword = async (id, password) => {
        try {
            await changePassword(id, password);
            alert("Contraseña actualizada correctamente");
        } catch (e) {
            console.error(e);
            alert("Error al actualizar contraseña");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("¿Eliminar usuario?")) {
            await deleteUser(id);
            loadData();
        }
    };

    // --- Sede Handlers ---
    const handleSedeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSede) {
                await updateSede(editingSede.id, sedeForm);
                alert("Sede actualizada");
            } else {
                await createSede(sedeForm);
                alert("Sede creada");
            }
            setEditingSede(null);
            setSedeForm({ nombre: '', ciudad: '', direccion: '', latitud: 4.6097, longitud: -74.0817 });
            loadData();
        } catch (e) { alert("Error guardando sede"); }
    };

    const handleEditSede = (sede) => {
        setEditingSede(sede);
        setSedeForm({ ...sede });
        setMapCenter([sede.latitud, sede.longitud]);
    };

    const handleDeleteSede = async (id) => {
        if (window.confirm("¿Eliminar sede?")) {
            await deleteSede(id);
            loadData();
        }
    };

    const handleCancelEdit = () => {
        setEditingSede(null);
        setSedeForm({ nombre: '', ciudad: '', direccion: '', latitud: 4.6097, longitud: -74.0817 });
    };

    const handleRefreshSedes = () => {
        loadData();
        // If we are managing processes, we might need to update the passed sede object.
        // But loadData updates 'sedes'. managingProcessesSede is a separate object state.
        // We should update it to reflect new processes.
        if (managingProcessesSede) {
            // Find the updated sede in the new list (we need to wait for state update or re-fetch specifically)
            getSedes().then(updatedSedes => {
                setSedes(updatedSedes);
                const updated = updatedSedes.find(s => s.id === managingProcessesSede.id);
                if (updated) setManagingProcessesSede(updated);
            });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="mb-0">⚙️ Administración</h1>
                <button onClick={() => window.location.href = '/'} className="btn btn-ghost">
                    ⬅️ Volver al Mapa
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('users')}>Usuarios</button>
                <button className={`btn ${activeTab === 'sedes' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sedes')}>Sedes</button>
            </div>

            {activeTab === 'users' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="card">
                        <h3>Usuarios Existentes</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {users.map(u => (
                                <li key={u.id} style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{u.username} <small style={{ color: '#64748b' }}>({u.role})</small></span>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => {
                                            const newPwd = prompt("Nueva contraseña para " + u.username);
                                            if (newPwd) handleChangePassword(u.id, newPwd);
                                        }} className="btn btn-warning" style={{ padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>🔑 Clave</button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '12px' }}>Eliminar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>Crear Usuario</h3>
                        <form onSubmit={handleCreateUser}>
                            <input className="mb-2" placeholder="Usuario" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
                            <input className="mb-2" type="password" placeholder="Contraseña" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                            <select className="mb-2" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="analista">Analista</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <button type="submit" className="btn btn-primary w-100">Crear</button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'sedes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Lista de Sedes */}
                    <div className="card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3>Inventario de Sedes</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {sedes.map(s => (
                                <li key={s.id} style={{ padding: '15px', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <strong>{s.nombre}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.ciudad} • {s.direccion}</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '5px' }}>
                                                Procesos: {s.procesos ? s.procesos.length : 0}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => setManagingProcessesSede(s)} className="btn btn-ghost" title="Gestionar Procesos" style={{ padding: '5px' }}>⚙️ Proc.</button>
                                            <button onClick={() => handleEditSede(s)} className="btn btn-ghost" title="Editar Sede" style={{ padding: '5px' }}>✏️</button>
                                            <button onClick={() => handleDeleteSede(s.id)} className="btn btn-ghost" title="Eliminar Sede" style={{ padding: '5px', color: '#ef4444' }}>🗑️</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Formulario de Edición/Creación */}
                    <div className="card">
                        <h3>{editingSede ? 'Editar Sede' : 'Nueva Sede'}</h3>
                        <form onSubmit={handleSedeSubmit}>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <input placeholder="Nombre Sede" value={sedeForm.nombre} onChange={e => setSedeForm({ ...sedeForm, nombre: e.target.value })} required />
                                <input placeholder="Ciudad" value={sedeForm.ciudad} onChange={e => setSedeForm({ ...sedeForm, ciudad: e.target.value })} required />
                                <input placeholder="Dirección" value={sedeForm.direccion} onChange={e => setSedeForm({ ...sedeForm, direccion: e.target.value })} required />

                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Ubicación (Seleccionar en Mapa)</label>
                                    <div style={{ height: '300px', marginBottom: '10px' }}>
                                        <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '4px' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <LocationMarker
                                                position={[sedeForm.latitud, sedeForm.longitud]}
                                                setPosition={(pos) => setSedeForm({ ...sedeForm, latitud: pos.lat, longitud: pos.lng })}
                                            />
                                        </MapContainer>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="number" step="any" placeholder="Lat" value={sedeForm.latitud} readOnly />
                                        <input type="number" step="any" placeholder="Lng" value={sedeForm.longitud} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingSede ? 'Actualizar' : 'Guardar Sede'}
                                </button>
                                {editingSede && (
                                    <button type="button" onClick={handleCancelEdit} className="btn btn-ghost">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {managingProcessesSede && (
                <ProcessManagementModal
                    sede={managingProcessesSede}
                    onClose={() => setManagingProcessesSede(null)}
                    onUpdate={handleRefreshSedes}
                />
            )}
        </div>
    );
};

export default AdminPanel;
