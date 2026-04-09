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

    // Life Events
    recordEvent: (data) => api.post('/common/life-events/', data),
};

export default commonApi;
