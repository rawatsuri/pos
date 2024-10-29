import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { socketService } from '../services/socket';

export const useSocket = () => {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      socketService.connect();
      if (user.branchId) {
        socketService.joinBranch(user.branchId);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [token, user]);

  return socketService;
};