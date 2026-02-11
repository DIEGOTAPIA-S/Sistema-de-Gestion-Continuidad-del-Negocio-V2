import api from './api';

export const getEventos = async () => {
    try {
        const response = await api.get('/eventos/');
        return response.data;
    } catch (error) {
        console.error("Error fetching eventos:", error);
        throw error;
    }
};

export const createEvento = async (eventoData) => {
    try {
        const response = await api.post('/eventos/', eventoData);
        return response.data;
    } catch (error) {
        console.error("Error creating evento:", error);
        throw error;
    }
};
