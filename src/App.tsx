
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { useSupabaseClientConfig } from './hooks/use-supabase-client-config';

// Create a wrapped component that uses the hook inside the AuthProvider
const AppContent = () => {
  // Initialize Supabase client config
  useSupabaseClientConfig();
  
  return (
    <BrowserRouter>
      <Toaster />
      <div className="min-h-screen">
        <div className="container">
          <div id="portal"></div>
        </div>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
