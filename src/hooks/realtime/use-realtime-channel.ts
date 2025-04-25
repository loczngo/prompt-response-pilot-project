
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const createRealtimeChannel = (channelId: string) => {
  return supabase.channel(channelId)
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
};
