import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: le dice al navegador que incluya las cookies en TODAS las peticiones
    // Sin esto, las cookies httpOnly (incluido el token JWT) no se enviarían
    withCredentials: true,
});

// Interceptor de request: agrega el token del localStorage SOLO si existe
// (para compatibilidad mientras la migración a cookies httpOnly no esté completa)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Si no hay token en localStorage, el navegador enviará la cookie httpOnly
        // automáticamente — no hace falta hacer nada más aquí
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: redirige al login si el servidor responde 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (!error.config.url.includes('/token/')) {
                // Limpiar localStorage y redirigir al login
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
