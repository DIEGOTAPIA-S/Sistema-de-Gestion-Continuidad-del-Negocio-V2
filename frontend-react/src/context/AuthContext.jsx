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
            const { access, refresh, full_name, role } = res.data;

            localStorage.setItem('token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_name', full_name);
            localStorage.setItem('role', role);

            setUser({ name: full_name, role });
            return { success: true };
        } catch (error) {
            console.error("Login error", error);

            // Extraer mensaje detallado si existe
            let message = "Credenciales inválidas o error de conexión";

            if (error.response) {
                if (error.response.status === 403) {
                    message = "Cuenta bloqueada por seguridad tras demasiados intentos fallidos. Por favor, comuníquese con el administrador o espere 24 horas.";
                } else if (error.response.data && error.response.data.detail) {
                    message = error.response.data.detail === "No active account found with the given credentials"
                        ? "Usuario o contraseña incorrectos. Verifique sus datos."
                        : error.response.data.detail;
                }
            }

            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
