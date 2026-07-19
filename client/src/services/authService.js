import api from './api.js';

export const register = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    return response.data.data;
};

export const emailLogin = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data.data;
};

export const getMe = async () => {
    const response = await api.get('/me');
    return response.data.data;
};

export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};
