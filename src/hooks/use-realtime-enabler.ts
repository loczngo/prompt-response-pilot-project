
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createRealtimeChannel } from './realtime/use-realtime-channel';
import { testDatabaseConnection } from './realtime/use-connection-test';

export const useRealtimeEnabler = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        console.log('Setting up realtime channels for tables');
        
        const isGuestUser = user?.role === 'guest';
        console.log('Is guest user:', isGuestUser);
        
        if (!isGuestUser) {
          const connectionSuccess = await testDatabaseConnection(user);
          if (!connectionSuccess && !isGuestUser) {
            throw new Error('Connection test failed');
          }
        }
        
        const channelId = 'realtime-enabler-' + Math.random().toString(36).substring(2, 9);
        console.log(`Creating realtime channel: ${channelId}`);
        
        const channel = createRealtimeChannel(channelId);
        
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime functionality enabled successfully');
            setIsEnabled(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime channel status:', status);
            if (isGuestUser) {
              console.log('Guest user - treating realtime as enabled despite errors');
              setIsEnabled(true);
            }
          }
        });
        
        return () => {
          console.log('Cleaning up realtime channel');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
        if (user?.role === 'guest') {
          console.log('Guest user - treating realtime as enabled despite errors');
          setIsEnabled(true);
        }
        return () => {};
      }
    };

    const cleanup = enableRealtime();
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [user]);

  return { isEnabled: user?.role === 'guest' ? true : isEnabled };
};
