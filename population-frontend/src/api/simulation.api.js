import axiosInstance from './axios';

export const simulationApi = {
    // Parameters
    getParameters: () => axiosInstance.get('/simulation/parameters/'),
    createParameter: (data) => axiosInstance.post('/simulation/parameters/', data),
    updateParameter: (id, data) => axiosInstance.put(`/simulation/parameters/${id}/`, data),
    deleteParameter: (id) => axiosInstance.delete(`/simulation/parameters/${id}/`),
};
