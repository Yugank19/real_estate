import api from './api';

export const predictionService = {
  predict: async (propertyData) => {
    const response = await api.post('/predictions/predict', propertyData);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/predictions/history');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/admin/summary');
    return response.data;
  }
};
