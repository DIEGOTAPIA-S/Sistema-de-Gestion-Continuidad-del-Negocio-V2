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
        <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Left Side - Image/Brand */}
            <div style={{
                flex: 1,
                backgroundImage: 'url("/login_background.png")', // Assumes image is in public folder
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '40px'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.2))'
                }}></div>
                <div style={{ position: 'relative', zIndex: 10, color: 'white' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: 'white' }}>Continuidad del Negocio</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '500px' }}>
                        Sistema de Gestión de Continuidad del Negocio
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                width: '500px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px',
                background: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{
                            width: '50px', height: '50px', background: '#3b82f6', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                            marginBottom: '20px', color: 'white', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                        }}>
                            🏥
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>Bienvenido</h2>
                        <p style={{ color: '#64748b' }}>Ingrese sus credenciales para acceder al panel.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Ej. administrador"
                                style={{
                                    width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px',
                                    fontSize: '0.95rem', transition: 'all 0.2s', backgroundColor: '#f8fafc'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Contraseña</label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px',
                                    fontSize: '0.95rem', transition: 'all 0.2s', backgroundColor: '#f8fafc'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none',
                                borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', transition: 'transform 0.1s'
                            }}
                            onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-1px)')}
                            onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
                        >
                            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>

                        {error && (
                            <div style={{
                                marginTop: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px',
                                color: '#991b1b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </form>

                    <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                        SISTEMA DE GESTION DE CONTINUIDAD DEL NEGOCIO - SEGURIDAD DE LA INFORMACION
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
