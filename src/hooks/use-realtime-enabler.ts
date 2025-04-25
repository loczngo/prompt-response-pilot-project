
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
        
        // Check if this is a guest user
        const isGuestUser = user?.role === 'guest';
        console.log('Is guest user:', isGuestUser);
        
        // For guest users, we skip the connection test entirely
        // This avoids 401 errors from trying to access tables they don't have permission for
        if (!isGuestUser) {
          // Only do connection test for authenticated users
          try {
            const { error: testError } = await supabase
              .from('announcements')
              .select('count(*)')
              .limit(1)
              .single();
              
            if (testError && testError.code !== '42501') {
              console.error('Supabase connection test failed:', testError);
              // Only throw if it's not a permission error (42501)
              if (testError.code !== 'PGRST301' && !testError.message.includes('JWT')) {
                throw testError;
              }
            }
          } catch (testError) {
            console.error('Error in connection test:', testError);
            // Continue despite error for guest users
            if (!isGuestUser) {
              throw testError;
            }
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
            // For guest users, we'll still consider realtime "enabled" even with errors
            if (isGuestUser) {
              console.log('Guest user - treating realtime as enabled despite errors');
              setIsEnabled(true);
            }
          }
        });
        
        // Return cleanup function
        return () => {
          console.log('Cleaning up realtime channel');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
        // For guest users, we'll still proceed with the app despite errors
        if (user?.role === 'guest') {
          console.log('Guest user - treating realtime as enabled despite errors');
          setIsEnabled(true);
        }
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

  return { isEnabled: user?.role === 'guest' ? true : isEnabled };
};
