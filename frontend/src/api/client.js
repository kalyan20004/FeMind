import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const getAssetHealth = () => API.get('/assets/health');
export const getActiveAlerts = () => API.get('/alerts/active');
export const analyzeSensor = (data) => API.post('/analyze/sensor', data);
export const getCascade = (data) => API.post('/analyze/cascade', data);
export const getCostAnalysis = (data) => API.post('/analyze/cost', data);
export const queryKnowledge = (data) => API.post('/query/knowledge', data);
export const getMaintenancePlan = (data) => API.post('/plan/maintenance', data);
export const submitFeedback = (data) => API.post('/feedback/submit', data);
export const generateReport = (data) => API.post('/report/generate', data, { responseType: 'blob' });

export const diagnosePhoto = (formData) =>
  API.post('/diagnose/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
