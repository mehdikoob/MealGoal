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
    if (!error.response) {
      toast.error('Serveur inaccessible — vérifiez votre connexion internet.');
    } else if (status >= 500) {
      toast.error('Erreur serveur inattendue. Réessayez dans quelques instants.');
    } else if (status === 401) {
      toast.error('Session expirée — reconnectez-vous pour continuer.');
    } else if (status === 403) {
      toast.error("Vous n'avez pas les droits pour effectuer cette action.");
    }
    // 404 et autres 4xx : gérés par chaque composant
    return Promise.reject(error);
  }
);
