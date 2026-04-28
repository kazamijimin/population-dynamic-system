import api from './axios';

export const commonApi = {
    // Household endpoints
    getHouseholds: (params) => api.get('/common/households/', { params }),
    getHousehold: (id) => api.get(`/common/households/${id}/`),
    createHousehold: (data) => api.post('/common/households/', data),
    updateHousehold: (id, data) => api.put(`/common/households/${id}/`, data),
    deleteHousehold: (id) => api.delete(`/common/households/${id}/`),

    // Population endpoints
    getPopulation: (params) => api.get('/common/population/', { params }),
    getPerson: (id) => api.get(`/common/population/${id}/`),
    createPerson: (data) => api.post('/common/population/', data),
    updatePerson: (id, data) => api.put(`/common/population/${id}/`, data),
    deletePerson: (id) => api.delete(`/common/population/${id}/`),
    archivePerson: (id) => api.patch(`/common/population/${id}/`, { status: 'Archived' }),

    // Zone endpoints
    getZones: () => api.get('/common/zones/'),
    createZone: (data) => api.post('/common/zones/', data),

    // Shop Flow Events
    getShopEvents: (params) => api.get('/common/shop-events/', { params }),
    recordShopEvent: (data) => api.post('/common/shop-events/', data),

    // Simulation Settings
    getSimulationSettings: () => api.get('/common/simulation-settings/'),
    updateSimulationSetting: (id, data) => api.patch(`/common/simulation-settings/${id}/`, data),

    // Operational Schedules
    getSchedules: (params) => api.get('/common/schedules/', { params }),
    createSchedule: (data) => api.post('/common/schedules/', data),
    updateSchedule: (id, data) => api.patch(`/common/schedules/${id}/`, data),
    deleteSchedule: (id) => api.delete(`/common/schedules/${id}/`),
};

export default commonApi;
