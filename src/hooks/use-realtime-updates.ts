
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedState } from './use-shared-state';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeUpdates = () => {
  const { user } = useAuth();
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [errorCount, setErrorCount] = useState(0);

  // Function to fetch initial data
  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      const isGuestUser = user?.role === 'guest';
      
      // Fetch tables with better error handling
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*');
      
      if (tablesError) {
        console.log('Error fetching tables:', tablesError);
        // For guest users, we'll use the cached data from localStorage if available
        if (isGuestUser && tables.length > 0) {
          console.log('Using cached tables data for guest user');
        } else {
          setErrorCount(prev => prev + 1);
        }
      } else if (tablesData) {
        console.log(`Fetched ${tablesData.length} tables from database`);
        setTables(tablesData);
        // Reset error count on successful fetch
        setErrorCount(0);
      }

      // Fetch prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (promptsError) {
        console.log('Error fetching prompts:', promptsError);
        if (isGuestUser && prompts.length > 0) {
          console.log('Using cached prompts data for guest user');
        } else {
          setErrorCount(prev => prev + 1);
        }
      } else if (promptsData) {
        console.log(`Fetched ${promptsData.length} prompts from database:`, promptsData);
        setPrompts(promptsData);
        setErrorCount(0);
      }

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (announcementsError) {
        console.log('Error fetching announcements:', announcementsError);
        if (isGuestUser && announcements.length > 0) {
          console.log('Using cached announcements data for guest user');
        } else {
          setErrorCount(prev => prev + 1);
        }
      } else if (announcementsData) {
        console.log(`Fetched ${announcementsData.length} announcements from database`);
        setAnnouncements(announcementsData);
        setErrorCount(0);
      }

      // If we have too many consecutive errors, set status to error
      if (errorCount >= 3) {
        setRealtimeStatus('error');
      } else if (errorCount === 0) {
        setRealtimeStatus('connected');
      }

      setIsInitialized(true);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      setErrorCount(prev => prev + 1);
      if (errorCount >= 3) {
        setRealtimeStatus('error');
      }
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
        (payload) => {
          console.log('Received realtime update for tables:', payload);
          fetchInitialData();
        }
      );
      
      // Prompts changes
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        (payload) => {
          console.log('Received realtime update for prompts:', payload);
          fetchInitialData();
        }
      );
      
      // Announcements changes
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('Received realtime update for announcements:', payload);
          fetchInitialData();
        }
      );

      // Subscribe to the channel with error handling
      newChannel
        .subscribe(async (status) => {
          console.log('Supabase realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates!');
            setRealtimeStatus('connected');
            await fetchInitialData();
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

  // Poll for updates as a fallback to realtime
  useEffect(() => {
    // For guest users, we'll use a more aggressive polling strategy
    const isGuestUser = user?.role === 'guest';
    const pollingInterval = isGuestUser ? 5000 : 10000; // 5 seconds for guests, 10 for others
    
    const interval = setInterval(() => {
      const now = Date.now();
      // Only refresh if it's been more than the polling interval since the last refresh
      if (now - lastRefreshTime > pollingInterval) {
        console.log('Polling for updates...');
        fetchInitialData();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [lastRefreshTime, user]);

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
  }, [user]); // Re-initialize when user changes

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
    refreshData,
    isInitialized
  };
};
