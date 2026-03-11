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

// Función utilitaria para leer el token CSRF de la cookie que Django envía al cliente.
// Django establece una cookie 'csrftoken' (que SÍ es legible por JS, a diferencia del JWT).
// Este token se adjunta en el header X-CSRFToken para que el servidor verifique la solicitud.
function getCsrfToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

// Interceptor de request: adjunta el token CSRF en todas las operaciones que modifican datos.
// GET y HEAD son operaciones de solo lectura → no necesitan CSRF.
// POST, PUT, PATCH, DELETE son mutables → las protegemos explícitamente.
const MUTATING_METHODS = ['post', 'put', 'patch', 'delete'];

api.interceptors.request.use(
    (config) => {
        if (MUTATING_METHODS.includes(config.method?.toLowerCase())) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
        }
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
