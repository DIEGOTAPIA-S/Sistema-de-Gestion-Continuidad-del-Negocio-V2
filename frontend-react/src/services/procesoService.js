import api from './api';

export const getProcesos = async () => {
    const response = await api.get('/procesos/');
    return response.data;
};

export const createProceso = async (procesoData) => {
    const response = await api.post('/procesos/', procesoData);
    return response.data;
};

export const updateProceso = async (id, procesoData) => {
    const response = await api.put(`/procesos/${id}/`, procesoData);
    return response.data;
};

export const deleteProceso = async (id) => {
    const response = await api.delete(`/procesos/${id}/`);
    return response.data;
};
