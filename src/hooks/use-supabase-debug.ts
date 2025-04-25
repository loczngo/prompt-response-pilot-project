
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    connectionStatus: 'unknown',
    authStatus: 'unknown',
    lastError: null as any
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First check if Supabase connection is working
        // Use proper typing to fix the TypeScript error
        const { data, error } = await supabase.rpc('postgres_version' as any);
        
        if (error) {
          console.warn('Supabase connection check error:', error);
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'error',
            lastError: error
          }));
        } else {
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'connected'
          }));
        }
        
        // Then check auth status
        const { data: session } = await supabase.auth.getSession();
        setDebugInfo(prev => ({
          ...prev,
          authStatus: session?.session ? 'authenticated' : 'unauthenticated'
        }));
        
      } catch (error) {
        console.error('Error in Supabase debug check:', error);
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'error',
          lastError: error
        }));
      }
    };
    
    checkConnection();
    
    // Also listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setDebugInfo(prev => ({
        ...prev,
        authStatus: session ? 'authenticated' : 'unauthenticated'
      }));
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return debugInfo;
};
