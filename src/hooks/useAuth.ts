import { useState, useCallback } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    // Token refresh logic
  }, []);

  return {
    isAuthenticated,
    token,
    refreshToken,
    setIsAuthenticated,
    setToken,
  };
};

export default useAuth;
