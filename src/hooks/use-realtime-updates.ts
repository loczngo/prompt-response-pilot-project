
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedState } from './use-shared-state';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from './use-toast';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();

  // Function to fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*, seats(*)');
      
      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        toast({
          title: "Data Loading Error",
          description: "Could not load tables information",
          variant: "destructive"
        });
      } else if (tablesData) {
        console.log(`Fetched ${tablesData.length} tables from database`);
        setTables(tablesData);
      } else {
        console.log("No tables data returned, but no error either");
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
  }, [setAnnouncements, setPrompts, setTables, toast]);

  // Setup realtime subscriptions and polling
  useEffect(() => {
    console.log('Initializing realtime updates and fallback polling...');
    
    // Initial data fetch
    fetchInitialData();
    
    // Create a unique channel name to avoid conflicts
    const channelName = `schema-db-changes-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up realtime channel: ${channelName}`);
    
    // Setup realtime subscriptions
    const newChannel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => fetchInitialData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        () => fetchInitialData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        () => fetchInitialData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchInitialData()
      )
      .subscribe((status) => {
        console.log(`Realtime channel ${channelName} status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (['TIMED_OUT', 'CLOSED', 'CHANNEL_ERROR'].includes(status)) {
          console.error(`Realtime subscription issue: ${status}`);
          setRealtimeStatus('error');
        }
      });
    
    setChannel(newChannel);
    
    // Set up polling as a fallback
    const pollingInterval = setInterval(() => {
      if (realtimeStatus !== 'connected') {
        console.log('Polling for updates as realtime connection is not active');
        fetchInitialData();
      }
    }, 10000); // Poll every 10 seconds if realtime is not working
    
    // Clean up subscriptions and intervals on unmount
    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(newChannel);
    };
  }, [fetchInitialData, realtimeStatus]);

  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    console.log('Manually refreshing data...');
    await fetchInitialData();
  }, [fetchInitialData]);

  // Function to reconnect if connection is lost
  const reconnect = useCallback(() => {
    console.log('Attempting to reconnect realtime...');
    setRealtimeStatus('connecting');
    
    // Remove existing channel if it exists
    if (channel) {
      supabase.removeChannel(channel);
    }
    
    // Create a new channel with a unique name
    const channelName = `schema-db-changes-${Math.random().toString(36).substring(2, 9)}`;
    
    const newChannel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => fetchInitialData()
      )
      .subscribe((status) => {
        console.log(`Reconnected realtime channel ${channelName} status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          fetchInitialData();
        } else if (['TIMED_OUT', 'CLOSED', 'CHANNEL_ERROR'].includes(status)) {
          setRealtimeStatus('error');
        }
      });
    
    setChannel(newChannel);
  }, [channel, fetchInitialData]);

  return { 
    tables, 
    prompts, 
    announcements, 
    realtimeStatus,
    refreshData,
    reconnect
  };
};
