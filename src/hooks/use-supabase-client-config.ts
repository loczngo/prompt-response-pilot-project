
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseClientConfig = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Configure request interceptor
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      // Only intercept Supabase requests
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      if (url.includes('supabase.co')) {
        console.log(`Intercepting Supabase fetch request to ${url}`);
        try {
          // Add retry logic
          const maxRetries = 2;
          let retries = 0;
          let response;
          
          while (retries <= maxRetries) {
            response = await originalFetch(input, init);
            
            // If the request succeeded or it's not a 403, break out of retry loop
            if (response.ok || response.status !== 403) {
              break;
            }
            
            retries++;
            console.log(`Received 403 from Supabase, retry attempt ${retries}/${maxRetries}`);
            
            // Add a small delay between retries
            await new Promise(resolve => setTimeout(resolve, 500 * retries));
          }
          
          return response;
        } catch (error) {
          console.error('Error in intercepted fetch:', error);
          throw error;
        }
      }
      
      // For non-Supabase requests, proceed normally
      return originalFetch(input, init);
    };
    
    // Restore original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  return null;
};
