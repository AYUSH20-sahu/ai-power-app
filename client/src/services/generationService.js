import api from './api.js';

export const generateCode = async (projectId, prompt) => {
    const response = await api.post(`/generate/${projectId}`, { prompt });
    return response.data.data;
};
