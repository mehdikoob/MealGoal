import axios from 'axios';
import { toast } from 'sonner';

export const API_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_URL) {
  console.error(
    '[MealGoal] VITE_BACKEND_URL is not defined.\n' +
    'Copy frontend/.env.example to frontend/.env and set the correct backend URL.'
  );
}

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
