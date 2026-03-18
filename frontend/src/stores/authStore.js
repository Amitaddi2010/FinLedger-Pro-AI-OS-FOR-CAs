import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  companies: [],
  activeCompanyId: null,
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data, activeCompanyId: data.activeCompanyId });
    return data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, activeCompanyId: null, companies: [] });
  },

  fetchCompanies: async () => {
    const { data } = await api.get('/companies');
    set({ companies: data });
  },

  switchCompany: async (companyId) => {
    const { data } = await api.post(`/companies/switch/${companyId}`);
    set((state) => ({ 
      activeCompanyId: data.activeCompanyId,
      user: { ...state.user, activeCompanyId: data.activeCompanyId }
    }));
  }
}));
