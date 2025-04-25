
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeEnabler = () => {
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        // Instead of trying to call a non-existent RPC function,
        // we'll enable realtime directly by subscribing to tables
        console.log('Setting up realtime channels for tables');
        
        // The channel will be cleaned up when the component unmounts
        const channel = supabase.channel('realtime-enabler')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public',
            table: 'prompts'
          }, () => {})
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public',
            table: 'tables'
          }, () => {})
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'announcements'
          }, () => {})
          .subscribe();
          
        console.log('Realtime functionality enabled on tables');
        
        // Return a cleanup function to unsubscribe when the component unmounts
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
      }
    };

    // Run the async function and store the cleanup function
    const cleanup = enableRealtime();
    
    // Call the cleanup function when the component unmounts
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, []);
};
