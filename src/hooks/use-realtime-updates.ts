
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedState } from './use-shared-state';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Function to fetch initial data
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (promptsError) {
        console.error('Error fetching prompts:', promptsError);
      } else if (promptsData) {
        console.log(`Fetched ${promptsData.length} prompts from database`);
        setPrompts(promptsData);
      }

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  // Function to setup realtime subscriptions
  const setupRealtimeSubscriptions = () => {
    try {
      // Remove any existing channel subscription to prevent duplicates
      if (channel) {
        supabase.removeChannel(channel);
      }

      console.log('Setting up new realtime subscriptions...');
      
      // Create a new channel with a unique name to avoid conflicts
      const newChannel = supabase.channel('schema-db-changes-' + Math.random().toString(36).substring(2, 9));
      
      // Tables changes
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        async (payload) => {
          console.log('Received realtime update for tables:', payload);
          await fetchInitialData();
        }
      );
      
      // Prompts changes
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        async (payload) => {
          console.log('Received realtime update for prompts:', payload);
          await fetchInitialData();
        }
      );
      
      // Announcements changes
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        async (payload) => {
          console.log('Received realtime update for announcements:', payload);
          await fetchInitialData();
        }
      );

      // Subscribe to the channel with status tracking and error handling
      newChannel
        .subscribe(async (status) => {
          console.log('Supabase realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates!');
            setRealtimeStatus('connected');
            await fetchInitialData(); // Fetch data once successfully subscribed
          } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error('Supabase realtime subscription issue:', status);
            setRealtimeStatus('error');
            
            // Try to fetch data anyway
            await fetchInitialData();
            
            // Auto-reconnect after a delay
            setTimeout(() => {
              console.log('Attempting to reconnect realtime subscription...');
              setupRealtimeSubscriptions();
            }, 5000);
          }
        });
      
      // Save the channel reference
      setChannel(newChannel);
      
      return newChannel;
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
      setRealtimeStatus('error');
      return null;
    }
  };

  useEffect(() => {
    console.log('Initializing realtime updates...');
    
    // Initial data fetch
    fetchInitialData();
    
    // Setup real-time subscriptions
    const newChannel = setupRealtimeSubscriptions();

    // Clean up on component unmount
    return () => {
      console.log('Cleaning up realtime subscriptions');
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, []);

  // Expose a function to manually refresh data
  const refreshData = async () => {
    console.log('Manually refreshing data...');
    await fetchInitialData();
  };

  return { 
    tables, 
    prompts, 
    announcements, 
    realtimeStatus,
    refreshData
  };
};
