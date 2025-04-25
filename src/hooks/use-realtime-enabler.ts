
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeEnabler = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        console.log('Setting up realtime channels for tables');
        
        // For guest users, we won't try to authenticate since they don't have Supabase sessions
        // Instead, we'll just set up the channel to listen for public data
        const isGuestUser = user?.role === 'guest';
        
        if (!isGuestUser) {
          // Only do connection test for authenticated users
          const { error: testError } = await supabase
            .from('announcements')
            .select('count(*)')
            .limit(1)
            .single();
            
          if (testError && testError.code !== '42501') {
            console.error('Supabase connection test failed:', testError);
            throw testError;
          }
        }
        
        // Set up channel with improved error handling
        const channelId = 'realtime-enabler-' + Math.random().toString(36).substring(2, 9);
        console.log(`Creating realtime channel: ${channelId}`);
        
        const channel = supabase.channel(channelId)
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
  }, [user]);

  return { isEnabled };
};
