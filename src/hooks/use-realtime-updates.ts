
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedState } from './use-shared-state';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    console.log('Setting up realtime updates...');
    
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial data from Supabase...');
        
        // Fetch tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*, seats(*)');
        
        if (tablesError) {
          console.error('Error fetching tables:', tablesError);
        } else if (tablesData) {
          console.log(`Fetched ${tablesData.length} tables from database`);
          setTables(tablesData);
        }

        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*');
        
        if (promptsError) {
          console.error('Error fetching prompts:', promptsError);
        } else if (promptsData) {
          console.log(`Fetched ${promptsData.length} prompts from database`);
          setPrompts(promptsData);
        }

        // Fetch announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*');
        
        if (announcementsError) {
          console.error('Error fetching announcements:', announcementsError);
        } else if (announcementsData) {
          console.log(`Fetched ${announcementsData.length} announcements from database`);
          setAnnouncements(announcementsData);
        }
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const channel = supabase.channel('schema-db-changes');
    
    // Tables changes
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tables' },
      async (payload) => {
        console.log('Received realtime update for tables:', payload);
        try {
          const { data, error } = await supabase
            .from('tables')
            .select('*, seats(*)');
          
          if (error) {
            console.error('Error fetching tables after realtime update:', error);
          } else if (data) {
            console.log(`Updated tables data with ${data.length} records`);
            setTables(data);
          }
        } catch (error) {
          console.error('Error handling tables realtime update:', error);
        }
      }
    );
    
    // Prompts changes
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'prompts' },
      async (payload) => {
        console.log('Received realtime update for prompts:', payload);
        try {
          const { data, error } = await supabase
            .from('prompts')
            .select('*');
          
          if (error) {
            console.error('Error fetching prompts after realtime update:', error);
          } else if (data) {
            console.log(`Updated prompts data with ${data.length} records`);
            setPrompts(data);
          }
        } catch (error) {
          console.error('Error handling prompts realtime update:', error);
        }
      }
    );
    
    // Announcements changes
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      async (payload) => {
        console.log('Received realtime update for announcements:', payload);
        try {
          const { data, error } = await supabase
            .from('announcements')
            .select('*');
          
          if (error) {
            console.error('Error fetching announcements after realtime update:', error);
          } else if (data) {
            console.log(`Updated announcements data with ${data.length} records`);
            setAnnouncements(data);
          }
        } catch (error) {
          console.error('Error handling announcements realtime update:', error);
        }
      }
    );

    // Subscribe to the channel with status tracking
    channel
      .subscribe((status) => {
        console.log('Supabase realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Supabase realtime subscription issue:', status);
          setRealtimeStatus('error');
        }
      });

    // Clean up on component unmount
    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(channel);
    };
  }, [setTables, setPrompts, setAnnouncements]);

  return { tables, prompts, announcements, realtimeStatus };
};
