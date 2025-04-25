import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/toaster';
import { useSupabaseClientConfig } from './hooks/use-supabase-client-config';

function App() {
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
}

export default App;
