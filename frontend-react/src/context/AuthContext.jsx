import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay sesión activa al cargar
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user_name');
        const savedRole = localStorage.getItem('role');

        if (token && savedUser) {
            setUser({ name: savedUser, role: savedRole });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await api.post('/token/', { username, password });

            if (res.data.two_factor_required) {
                return {
                    success: true,
                    requires2FA: true,
                    preAuthId: res.data.pre_auth_id,
                    username: res.data.username
                };
            }

            const { access, refresh, full_name, role } = res.data;
            saveAuthData(access, refresh, full_name, role);
            return { success: true };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const verifyOTP = async (preAuthId, token) => {
        try {
            const res = await api.post('/2fa/verify/', { pre_auth_id: preAuthId, token });
            const { access, refresh, full_name, role } = res.data;

            saveAuthData(access, refresh, full_name, role);
            return { success: true };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const saveAuthData = (access, refresh, name, role) => {
        localStorage.setItem('token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_name', name);
        localStorage.setItem('role', role);
        setUser({ name, role });
    };

    const handleAuthError = (error) => {
        console.error("Auth error", error);
        let message = "Credenciales inválidas o error de conexión al servidor";

        if (error.response) {
            const data = error.response.data;
            if (error.response.status === 403) {
                if (data && data.detail && data.detail.includes("locked")) {
                    message = "Cuenta bloqueada por seguridad tras demasiados intentos fallidos. Espere 24 horas.";
                } else {
                    message = "Acceso denegado. Verifique sus permisos o intente de nuevo.";
                }
            } else if (data) {
                if (data.error) {
                    message = data.error;
                } else if (data.detail) {
                    // Si el detail es un objeto o tiene el mensaje estándar de DRF
                    if (typeof data.detail === 'string' && data.detail.includes("No active account")) {
                        message = "Usuario o contraseña incorrectos. Verifique sus datos.";
                    } else {
                        message = String(data.detail);
                    }
                } else if (data.non_field_errors) {
                    message = data.non_field_errors[0];
                }
            }
        } else if (error.request) {
            message = "No se pudo contactar con el servidor. Verifique que el servicio esté activo.";
        }

        return { success: false, message };
    };

    const sendEmailOTP = async (preAuthId) => {
        try {
            await api.post('/2fa/send-email/', { pre_auth_id: preAuthId });
            return { success: true };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const logout = async () => {
        try {
            // Llamar al servidor para que borre las cookies httpOnly
            // IMPORTANTE: las cookies httpOnly NO se pueden borrar desde JavaScript
            // Solo el servidor puede borrarlas con Set-Cookie. Por eso necesitamos este endpoint.
            await api.post('/logout/');
        } catch (error) {
            // Si falla el logout del servidor, igual limpiamos el estado local
            console.warn('Logout en servidor falló, limpiando estado local:', error);
        } finally {
            localStorage.clear();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, verifyOTP, sendEmailOTP, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
