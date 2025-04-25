
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeEnabler = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { toast } = useToast();

  const connectRealtime = useCallback(async () => {
    try {
      console.log('Setting up realtime channels for tables...');
      
      // Add realtime tables to the publication
      const tablesToTrack = ['tables', 'seats', 'prompts', 'announcements'];
      
      // Create a unique channel name to avoid conflicts
      const channelId = `system-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Creating channel: ${channelId}`);
      
      // Create a basic channel subscription to test connectivity
      const channel = supabase.channel(channelId);
      
      channel
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync event received');
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channelId}:`, status);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully established realtime connection');
            setIsEnabled(true);
            // Reset connection attempts on success
            setConnectionAttempts(0);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error connecting to realtime channels');
            setIsEnabled(false);
            toast({
              title: "Realtime Connection Issue",
              description: "There was a problem connecting to realtime updates. Some features may not update automatically.",
              variant: "destructive"
            });
          } else if (status === 'TIMED_OUT') {
            console.error('Connection timed out');
            setIsEnabled(false);
          }
        });

      return () => {
        console.log(`Cleaning up realtime connection: ${channelId}`);
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime functionality:', error);
      setIsEnabled(false);
      toast({
        title: "Realtime Connection Failed",
        description: "Unable to establish realtime updates. Some features may not update automatically.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Set up automatic reconnection with exponential backoff
  useEffect(() => {
    let cleanup = connectRealtime();
    
    // If we're not enabled and haven't exceeded max attempts, try reconnecting
    const maxAttempts = 3;
    let reconnectTimer: number | null = null;
    
    if (!isEnabled && connectionAttempts < maxAttempts) {
      const delay = Math.min(2000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff capped at 30s
      console.log(`Scheduling reconnection attempt ${connectionAttempts + 1} in ${delay}ms`);
      
      reconnectTimer = window.setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
        if (cleanup) cleanup();
        cleanup = connectRealtime();
      }, delay);
    }
    
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (cleanup) cleanup();
    };
  }, [connectRealtime, isEnabled, connectionAttempts]);

  return { isEnabled };
};
