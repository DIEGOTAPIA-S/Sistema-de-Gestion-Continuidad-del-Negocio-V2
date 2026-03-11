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

// Interceptor de request: Ya no inyectamos el token manualmente.
// El navegador envía automáticamente las cookies httpOnly gracias a withCredentials: true.
api.interceptors.request.use(
    (config) => config,
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
