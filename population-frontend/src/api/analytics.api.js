import axiosInstance from './axios';

export const analyticsApi = {
    getReports: (params) => axiosInstance.get('/analytics/reports/', { params }),
    getReport: (id) => axiosInstance.get(`/analytics/reports/${id}/`),
    createReport: (data) => axiosInstance.post('/analytics/reports/', data),
    getSalesReports: (params = {}) => axiosInstance.get('/analytics/reports/', { params: { ...params, type: 'sales' } }),
    
    // Historical Data
    getHistoricalData: () => axiosInstance.get('/analytics/historical-data/'),
    getHistoricalSales: () => axiosInstance.get('/analytics/historical-data/'),
    uploadHistoricalData: (data) => axiosInstance.post('/analytics/historical-data/', data),
    deleteHistoricalData: (id) => axiosInstance.delete(`/analytics/historical-data/${id}/`),
};
