import axios from 'axios';
import { toast } from 'sonner';

// Empty string = use relative URLs (nginx proxies /api/ to the backend in prod)
export const API_URL = import.meta.env.VITE_BACKEND_URL ?? '';

if (API_URL === undefined) {
  console.warn('[MealGoal] VITE_BACKEND_URL is not defined — using relative /api/ paths.');
}

export const TOKEN_KEY = 'mealgoal_token';
export const ADMIN_TOKEN_KEY = 'mealgoal_admin_token';

// Attach JWT token to every outgoing request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Axios error interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 0 || !error.response) {
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } else if (status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer.');
    } else if (status === 401) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
    } else if (status === 403) {
      toast.error('Accès refusé.');
    } else if (status === 404) {
      // Let components handle 404s silently
    }
    return Promise.reject(error);
  }
);
