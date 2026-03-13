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
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

  useEffect(() => {
    // ページロード時にトークンを復元
    const savedToken = localStorage.getItem('google_access_token');
    const savedExpiry = localStorage.getItem('google_token_expiry');
    
    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry, 10);
      const now = Date.now();
      
      // トークンが有効期限内かチェック
      if (expiryTime > now) {
        setAccessToken(savedToken);
        setTokenExpiry(expiryTime);
        setIsAuthenticated(true);
      } else {
        // 期限切れの場合はクリア
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  // トークンの有効期限をチェックして自動更新
  useEffect(() => {
    if (!tokenExpiry || !isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeUntilExpiry = tokenExpiry - now;
      
      // 有効期限の5分前になったら自動更新
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('Token expiring soon, refreshing...');
        login();
      } else if (timeUntilExpiry <= 0) {
        // 期限切れの場合はログアウト
        console.log('Token expired, logging out...');
        logout();
      }
    }, 60 * 1000); // 1分ごとにチェック

    return () => clearInterval(checkInterval);
  }, [tokenExpiry, isAuthenticated]);

  const login = () => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setIsAuthenticated(true);
          
          // トークンの有効期限を計算（通常1時間）
          const expiryTime = Date.now() + (response.expires_in || 3600) * 1000;
          setTokenExpiry(expiryTime);
          
          localStorage.setItem('google_access_token', response.access_token);
          localStorage.setItem('google_token_expiry', expiryTime.toString());
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
    setTokenExpiry(null);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    
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
