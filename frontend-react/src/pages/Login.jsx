import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-end p-10 bg-cover bg-center" style={{ backgroundImage: 'url("/login_background.png")' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/20"></div>
                <div className="relative z-10 text-white">
                    <h1 className="text-4xl font-extrabold mb-2 text-white">Continuidad del Negocio</h1>
                    <p className="text-lg opacity-90 max-w-lg">
                        Sistema de Gestión de Continuidad del Negocio
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[500px] flex flex-col justify-center p-10 bg-white">
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl mb-5 text-white shadow-lg shadow-blue-500/50">
                            🏥
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido</h2>
                        <p className="text-slate-500">Ingrese sus credenciales para acceder al panel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Ej. administrador"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base transition-all bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base transition-all bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/40 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>

                        {error && (
                            <div className="mt-5 p-3 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center text-xs text-slate-400 font-medium uppercase tracking-wide">
                        SISTEMA DE GESTION DE CONTINUIDAD DEL NEGOCIO<br />SEGURIDAD DE LA INFORMACION
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
