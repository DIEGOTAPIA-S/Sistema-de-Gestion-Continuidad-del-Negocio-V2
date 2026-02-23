import api from './api';

export const fetchColaboradores = async () => {
    try {
        const response = await api.get('/colaboradores/');
        return response.data;
    } catch (error) {
        console.error("Error fetching colaboradores:", error);
        throw error;
    }
};

export const uploadColaboradoresExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/colaboradores/upload_excel/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading excel:", error);
        throw error;
    }
};

export const deleteColaboradores = async () => {
    try {
        const response = await api.delete('/colaboradores/delete_all/');
        return response.data;
    } catch (error) {
        console.error("Error deleting colaboradores:", error);
        throw error;
    }
};
