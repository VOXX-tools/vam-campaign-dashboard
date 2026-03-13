import { GoogleAuthProvider, useGoogleAuth } from './context/GoogleAuthContext';
import { AppContextProvider } from './context/AppContext';
import { LoginButton } from './components/LoginButton';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { isAuthenticated, isLoading } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">VAMキャンペーン監視ダッシュボード</h1>
          <p className="text-gray-600 mb-6">
            Googleアカウントでログインしてください
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">VAMキャンペーン監視ダッシュボード</h1>
          <LoginButton />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleAuthProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </GoogleAuthProvider>
  );
}

export default App;
