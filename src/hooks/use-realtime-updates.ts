
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
  const [lastError, setLastError] = useState<any>(null);

  // Determine if user is a guest
  const isGuestUser = user?.role === 'guest';
  
  // Use more aggressive polling for guest users
  const pollingInterval = isGuestUser ? 3000 : 10000; // 3 seconds for guests, 10 for others

  // Function to fetch initial data
  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      
      // For guest users, we'll use localStorage cache as primary data source and treat Supabase as secondary
      // This avoids permission errors while still allowing real-time updates when they work
      const shouldUseCache = isGuestUser && (tables.length > 0 || prompts.length > 0 || announcements.length > 0);
      
      if (shouldUseCache) {
        console.log('Guest user with existing data - using cached data as primary source');
      }
      
      let tablesData = tables;
      let promptsData = prompts;
      let announcementsData = announcements;
      let hasNewData = false;
      
      // Attempt to fetch tables with better error handling
      try {
        const { data: fetchedTables, error: tablesError } = await supabase
          .from('tables')
          .select('*');
        
        if (tablesError) {
          console.log('Error fetching tables:', tablesError);
          setLastError(tablesError);
          // Don't increment error count for expected permission errors for guests
          if (!isGuestUser || (tablesError.code !== 'PGRST301' && !tablesError.message.includes('JWT'))) {
            setErrorCount(prev => prev + 1);
          }
        } else if (fetchedTables && fetchedTables.length > 0) {
          console.log(`Fetched ${fetchedTables.length} tables from database`);
          tablesData = fetchedTables;
          hasNewData = true;
          setErrorCount(0);
        }
      } catch (error) {
        console.error('Error in fetchTables:', error);
        setLastError(error);
      }

      // Try to fetch prompts
      try {
        const { data: fetchedPrompts, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (promptsError) {
          console.log('Error fetching prompts:', promptsError);
          setLastError(promptsError);
          // Don't increment error count for expected permission errors for guests
          if (!isGuestUser || (promptsError.code !== 'PGRST301' && !promptsError.message.includes('JWT'))) {
            setErrorCount(prev => prev + 1);
          }
        } else if (fetchedPrompts && fetchedPrompts.length > 0) {
          console.log(`Fetched ${fetchedPrompts.length} prompts from database:`, fetchedPrompts);
          promptsData = fetchedPrompts;
          hasNewData = true;
          setErrorCount(0);
        }
      } catch (error) {
        console.error('Error in fetchPrompts:', error);
        setLastError(error);
      }

      // Try to fetch announcements
      try {
        const { data: fetchedAnnouncements, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (announcementsError) {
          console.log('Error fetching announcements:', announcementsError);
          setLastError(announcementsError);
          // Don't increment error count for expected permission errors for guests
          if (!isGuestUser || (announcementsError.code !== 'PGRST301' && !announcementsError.message.includes('JWT'))) {
            setErrorCount(prev => prev + 1);
          }
        } else if (fetchedAnnouncements && fetchedAnnouncements.length > 0) {
          console.log(`Fetched ${fetchedAnnouncements.length} announcements from database`);
          announcementsData = fetchedAnnouncements;
          hasNewData = true;
          setErrorCount(0);
        }
      } catch (error) {
        console.error('Error in fetchAnnouncements:', error);
        setLastError(error);
      }

      // Update shared state if we have new data or if this is the first initialization
      if (hasNewData || !isInitialized) {
        setTables(tablesData);
        setPrompts(promptsData);
        setAnnouncements(announcementsData);
      }

      // Update status based on error count and user type
      if (errorCount >= 3 && !isGuestUser) {
        setRealtimeStatus('error');
      } else if (errorCount === 0 || isGuestUser) {
        // For guest users, we'll always show connected status unless there are critical errors
        setRealtimeStatus('connected');
      }

      setIsInitialized(true);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      setLastError(error);
      setErrorCount(prev => prev + 1);
      
      // For guest users, we want to be more lenient about errors
      if (errorCount >= 5 && !isGuestUser) {
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
            
            // For guest users, we'll still consider the connection as working
            if (isGuestUser) {
              console.log('Guest user - keeping status as connected despite errors');
              setRealtimeStatus('connected');
            } else {
              setRealtimeStatus('error');
            }
            
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
    const interval = setInterval(() => {
      const now = Date.now();
      // Only refresh if it's been more than the polling interval since the last refresh
      if (now - lastRefreshTime > pollingInterval) {
        console.log(`Polling for updates (${isGuestUser ? 'guest user' : 'regular user'})...`);
        fetchInitialData();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [lastRefreshTime, user, pollingInterval, isGuestUser]);

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
    isInitialized,
    lastError
  };
};
