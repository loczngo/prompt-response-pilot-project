
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '../use-toast';

export type RealtimeStatus = 'connecting' | 'connected' | 'error';

export const useRealtimeChannel = () => {
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();

  const setupChannel = useCallback((onDataChange: () => void) => {
    const channelName = `schema-db-changes-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up realtime channel: ${channelName}`);
    
    const newChannel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => onDataChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        () => onDataChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        () => onDataChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => onDataChange()
      )
      .subscribe((status) => {
        console.log(`Realtime channel ${channelName} status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (['TIMED_OUT', 'CLOSED', 'CHANNEL_ERROR'].includes(status)) {
          console.error(`Realtime subscription issue: ${status}`);
          setRealtimeStatus('error');
          toast({
            title: "Realtime Connection Error",
            description: "Some features may not update automatically.",
            variant: "destructive"
          });
        }
      });
    
    setChannel(newChannel);
    return newChannel;
  }, [toast]);

  const cleanup = useCallback(() => {
    if (channel) {
      console.log('Cleaning up realtime channel');
      supabase.removeChannel(channel);
      setChannel(null);
    }
  }, [channel]);

  return {
    realtimeStatus,
    setupChannel,
    cleanup
  };
};
