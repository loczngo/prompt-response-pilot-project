
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { useSupabaseClientConfig } from './hooks/use-supabase-client-config';
import Index from './pages/Index';

// Create a wrapped component that uses the hook inside the AuthProvider
const AppContent = () => {
  // Initialize Supabase client config
  useSupabaseClientConfig();
  
  return (
    <BrowserRouter>
      <Toaster />
      <div className="min-h-screen">
        <div className="container">
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
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
