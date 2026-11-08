import apiClient from './apiClient';
import { authStorage } from '../config/env';

export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { access_token, user, session_id } = response.data;
    if (access_token) {
      authStorage.setToken(access_token);
      if (user) authStorage.setUser(user);
    }
    return { token: access_token, user, sessionId: session_id };
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile', { suppressErrorToast: true });
    return response.data.user;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {}, { suppressErrorToast: true });
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.removeToken();
    }
  }
};

export default authService;

