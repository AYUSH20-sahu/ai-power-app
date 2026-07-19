import axios from 'axios';

const BASE_URL = 'https://ai-power-app.onrender.com/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const api = {
    get: async (url) => axios.get(`${BASE_URL}${url}`, { headers: getHeaders() }),
    post: async (url, data) => axios.post(`${BASE_URL}${url}`, data, { headers: getHeaders() }),
    put: async (url, data) => axios.put(`${BASE_URL}${url}`, data, { headers: getHeaders() }),
    delete: async (url) => axios.delete(`${BASE_URL}${url}`, { headers: getHeaders() }),
};

export default api;
