import { useAuthContext } from '../contexts/AuthContext';

// Re-export hook for cleaner imports across components
export const useAuth = () => {
  return useAuthContext();
};
