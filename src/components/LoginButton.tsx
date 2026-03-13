import React from 'react';
import { useGoogleAuth } from '../context/GoogleAuthContext';

export const LoginButton: React.FC = () => {
  const { isAuthenticated, login, logout } = useGoogleAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Googleでログイン
    </button>
  );
};
