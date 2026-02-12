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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                            <span className="text-xl">⚙️</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Panel de Administración</h1>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="text-slate-500 hover:text-blue-600 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                        <span>⬅️</span> Volver al Mapa
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200">
                    <button 
                        className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                    <button 
                        className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'sedes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('sedes')}
                    >
                        Sedes
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800">Usuarios Existentes</h3>
                            </div>
                            <ul className="divide-y divide-slate-100">
                                {users.map(u => (
                                    <li key={u.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{u.username}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-wider">{u.role}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    const newPwd = prompt("Nueva contraseña para " + u.username);
                                                    if (newPwd) handleChangePassword(u.id, newPwd);
                                                }} 
                                                className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                                            >
                                                🔑 Clave
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)} 
                                                className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800">Crear Nuevo Usuario</h3>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                                        <input 
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Ej. juan.perez" 
                                            value={newUser.username} 
                                            onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                        <input 
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={newUser.password} 
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                        <select 
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                            value={newUser.role} 
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="analista">Analista</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98]"
                                    >
                                        Crear Usuario
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sedes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Lista de Sedes */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-[800px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800">Inventario de Sedes</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-0">
                                <ul className="divide-y divide-slate-100">
                                    {sedes.map(s => (
                                        <li key={s.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <strong className="text-slate-800 block mb-1">{s.nombre}</strong>
                                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">📍 {s.ciudad}</span>
                                                        <span className="truncate max-w-[200px]">{s.direccion}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-2">
                                                        Procesos registrados: {s.procesos ? s.procesos.length : 0}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setManagingProcessesSede(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Gestionar Procesos">⚙️</button>
                                                    <button onClick={() => handleEditSede(s)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar Sede">✏️</button>
                                                    <button onClick={() => handleDeleteSede(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Sede">🗑️</button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Formulario de Sede */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit sticky top-24">
                             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">{editingSede ? 'Editar Sede' : 'Registrar Nueva Sede'}</h3>
                                {editingSede && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">Editando</span>}
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSedeSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Sede</label>
                                        <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Sede Central" value={sedeForm.nombre} onChange={e => setSedeForm({ ...sedeForm, nombre: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                                            <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Bogotá" value={sedeForm.ciudad} onChange={e => setSedeForm({ ...sedeForm, ciudad: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                            <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Cra 7 #32-15" value={sedeForm.direccion} onChange={e => setSedeForm({ ...sedeForm, direccion: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-sm font-medium text-slate-700 mb-3 flex justify-between">
                                            <span>Ubicación Exacta</span>
                                            <span className="text-xs text-slate-400 font-normal">Haga clic en el mapa</span>
                                        </label>
                                        <div className="h-64 rounded-lg overflow-hidden border border-slate-300 shadow-inner mb-3">
                                            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <LocationMarker
                                                    position={[sedeForm.latitud, sedeForm.longitud]}
                                                    setPosition={(pos) => setSedeForm({ ...sedeForm, latitud: pos.lat, longitud: pos.lng })}
                                                />
                                            </MapContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white px-3 py-2 border border-slate-200 rounded text-xs text-slate-600 font-mono">
                                                Lat: {sedeForm.latitud?.toFixed(6)}
                                            </div>
                                            <div className="bg-white px-3 py-2 border border-slate-200 rounded text-xs text-slate-600 font-mono">
                                                Lng: {sedeForm.longitud?.toFixed(6)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all">
                                            {editingSede ? 'Actualizar Sede' : 'Guardar Sede'}
                                        </button>
                                        {editingSede && (
                                            <button type="button" onClick={handleCancelEdit} className="px-6 bg-white border border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
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
            </main>
        </div>
    );
};

export default AdminPanel;
