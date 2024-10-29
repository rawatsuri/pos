import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import { socketService } from '../services/socket';

export const useSocket = () => {
  const { user, token } = useAuthStore();
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (token && user && !connectionAttempted.current) {
      connectionAttempted.current = true;
      socketService.connect();
      
      if (user.branchId) {
        socketService.joinBranch(user.branchId);
      }
    }

    return () => {
      if (connectionAttempted.current) {
        socketService.disconnect();
        connectionAttempted.current = false;
      }
    };
  }, [token, user]);

  return {
    isConnected: socketService.isConnected(),
    socket: socketService
  };
};