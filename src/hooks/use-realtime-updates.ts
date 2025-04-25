
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedState } from './use-shared-state';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      // Fetch tables
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*, seats(*)');
      if (tablesData) setTables(tablesData);

      // Fetch prompts
      const { data: promptsData } = await supabase
        .from('prompts')
        .select('*');
      if (promptsData) setPrompts(promptsData);

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*');
      if (announcementsData) setAnnouncements(announcementsData);
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const channel = supabase.channel('schema-db-changes')
      // Tables changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        async () => {
          const { data } = await supabase
            .from('tables')
            .select('*, seats(*)');
          if (data) setTables(data);
        }
      )
      // Prompts changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        async () => {
          const { data } = await supabase
            .from('prompts')
            .select('*');
          if (data) setPrompts(data);
        }
      )
      // Announcements changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        async () => {
          const { data } = await supabase
            .from('announcements')
            .select('*');
          if (data) setAnnouncements(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setTables, setPrompts, setAnnouncements]);

  return { tables, prompts, announcements };
};
