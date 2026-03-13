import React, { createContext, useContext, useState, useEffect } from 'react';

interface GoogleAuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ページロード時にトークンを復元
    const savedToken = localStorage.getItem('google_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      callback: (response) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setIsAuthenticated(true);
          localStorage.setItem('google_access_token', response.access_token);
        } else if (response.error) {
          console.error('OAuth error:', response.error);
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('google_access_token');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <GoogleAuthContext.Provider value={{ accessToken, isAuthenticated, login, logout, isLoading }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  }
  return context;
};
