import api from './api';

export const getSedes = async () => {
    try {
        const response = await api.get('/sedes/');
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error("Respuesta inesperada de sedes (no es array):", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching sedes (Detail):", error.response ? error.response.data : error.message);
        return [];
    }
};

export const createSede = async (sedeData) => {
    try {
        const response = await api.post('/sedes/', sedeData);
        return response.data;
    } catch (error) {
        console.error("Error creating sede:", error);
        throw error;
    }
};

export const updateSede = async (id, sedeData) => {
    try {
        const response = await api.put(`/sedes/${id}/`, sedeData);
        return response.data;
    } catch (error) {
        console.error("Error updating sede:", error);
        throw error;
    }
};

export const deleteSede = async (id) => {
    try {
        const response = await api.delete(`/sedes/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sedes (Detail):", error.response ? error.response.data : error.message);
        throw error;
    }
};
