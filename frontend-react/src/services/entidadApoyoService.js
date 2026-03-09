import api from './api';

export const getEntidadesApoyo = async (tipo = null) => {
    try {
        const params = tipo ? { tipo } : {};
        const response = await api.get('/entidades-apoyo/', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching entidades de apoyo:", error);
        return [];
    }
};

export const getEntidadApoyo = async (id) => {
    const response = await api.get(`/entidades-apoyo/${id}/`);
    return response.data;
};
