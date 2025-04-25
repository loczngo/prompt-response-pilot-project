
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeEnabler = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const enableRealtime = async () => {
      try {
        console.log('Setting up realtime channels for tables');
        
        // Make a connection test to verify authentication
        const { error: testError } = await supabase
          .from('announcements')
          .select('count(*)')
          .limit(1)
          .single();
          
        if (testError && testError.code !== '42501') {
          console.error('Supabase connection test failed:', testError);
          throw testError;
        }
        
        // Set up channel with improved error handling
        const channel = supabase.channel('realtime-enabler-' + Math.random().toString(36).substring(2, 9))
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public',
            table: 'prompts'
          }, (payload) => {
            console.log('Realtime update received for prompts:', payload);
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public',
            table: 'tables'
          }, (payload) => {
            console.log('Realtime update received for tables:', payload);
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'announcements'
          }, (payload) => {
            console.log('Realtime update received for announcements:', payload);
          });
        
        // Subscribe to channel with status handling  
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime functionality enabled successfully');
            setIsEnabled(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime channel status:', status);
            // Could implement reconnection logic here
          }
        });
        
        // Return cleanup function
        return () => {
          console.log('Cleaning up realtime channel');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
        return () => {}; // Return empty cleanup on error
      }
    };

    // Run the enabler and store cleanup function
    const cleanup = enableRealtime();
    
    // Return cleanup function
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, []);

  return { isEnabled };
};
