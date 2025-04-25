
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeEnabler = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const enableRealtimeChannels = async () => {
      try {
        console.log('Setting up realtime channels for tables...');
        
        // Add realtime tables to the publication
        const tablesToTrack = ['tables', 'seats', 'prompts', 'announcements'];
        
        // Create a basic channel subscription to test connectivity
        const channel = supabase.channel('system');
        
        channel
          .on('presence', { event: 'sync' }, () => {
            console.log('Presence sync event received');
          })
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('Successfully established realtime connection');
              setIsEnabled(true);
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Error connecting to realtime channels');
              toast({
                title: "Realtime Connection Issue",
                description: "There was a problem connecting to realtime updates. Some features may not update automatically.",
                variant: "destructive"
              });
            }
          });

        return () => {
          console.log('Cleaning up realtime connections');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up realtime functionality:', error);
        toast({
          title: "Realtime Connection Failed",
          description: "Unable to establish realtime updates. Some features may not update automatically.",
          variant: "destructive"
        });
      }
    };

    enableRealtimeChannels();
  }, [toast]);

  return { isEnabled };
};
