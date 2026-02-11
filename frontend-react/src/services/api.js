import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy configurado en vite.config.js
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores (ej. token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido (Ignore if login request)
            if (!error.config.url.includes('/token/')) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
