
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeSubscriber = (
  tableName: string,
  onUpdate: () => void
) => {
  useEffect(() => {
    const channelId = `${tableName}_updates_${Math.random().toString(36).substring(2, 9)}`;
    let channel: RealtimeChannel | null = null;
    
    try {
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName as any },
          (payload) => {
            console.log(`Realtime update for ${tableName}:`, payload);
            setTimeout(() => onUpdate(), 500);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${tableName}: ${status}`);
        });
    } catch (err) {
      console.error(`Error setting up realtime for ${tableName}:`, err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, onUpdate]);
};
