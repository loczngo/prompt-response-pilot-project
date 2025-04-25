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

  const isGuestUser = user?.role === 'guest';

  const pollingInterval = isGuestUser ? 10000 : 20000;

  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      
      const shouldUseCache = isGuestUser && (tables.length > 0 || prompts.length > 0 || announcements.length > 0);
      
      if (shouldUseCache) {
        console.log('Guest user with existing data - using cached data as primary source');
      }
      
      let tablesData = tables;
      let promptsData = prompts;
      let announcementsData = announcements;
      let hasNewData = false;
      
      try {
        const { data: fetchedTables, error: tablesError } = await supabase
          .from('tables')
          .select('*');
        
        if (tablesError) {
          console.log('Error fetching tables:', tablesError);
          setLastError(tablesError);
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

      if (isGuestUser && user?.tableNumber) {
        try {
          const { data: fetchedSeats, error: seatsError } = await supabase
            .from('seats')
            .select('*')
            .eq('table_id', user.tableNumber);
          
          if (seatsError) {
            console.log('Error fetching seats:', seatsError);
            setLastError(seatsError);
          } else if (fetchedSeats && fetchedSeats.length > 0) {
            console.log(`Fetched ${fetchedSeats.length} seats for table ${user.tableNumber}`);
            
            if (tablesData.length > 0) {
              const tableIndex = tablesData.findIndex(t => t.id === user.tableNumber);
              if (tableIndex >= 0) {
                tablesData[tableIndex].seats = fetchedSeats;
                hasNewData = true;
              }
            }
          }
        } catch (error) {
          console.error('Error in fetchSeats:', error);
        }
      }

      try {
        const { data: fetchedPrompts, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (promptsError) {
          console.log('Error fetching prompts:', promptsError);
          setLastError(promptsError);
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

      try {
        const { data: fetchedAnnouncements, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (announcementsError) {
          console.log('Error fetching announcements:', announcementsError);
          setLastError(announcementsError);
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

      if (hasNewData || !isInitialized) {
        setTables(tablesData);
        setPrompts(promptsData);
        setAnnouncements(announcementsData);
      }

      if (errorCount >= 3 && !isGuestUser) {
        setRealtimeStatus('error');
      } else if (errorCount === 0 || isGuestUser) {
        setRealtimeStatus('connected');
      }

      setIsInitialized(true);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      setLastError(error);
      setErrorCount(prev => prev + 1);
      
      if (errorCount >= 5 && !isGuestUser) {
        setRealtimeStatus('error');
      }
    }
  };

  const setupRealtimeSubscriptions = () => {
    try {
      if (channel) {
        supabase.removeChannel(channel);
      }

      console.log('Setting up new realtime subscriptions...');
      
      const newChannel = supabase.channel('schema-db-changes-' + Math.random().toString(36).substring(2, 9));
      
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          console.log('Received realtime update for tables:', payload);
          fetchInitialData();
        }
      );
      
      if (isGuestUser && user?.tableNumber) {
        newChannel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'seats' },
          (payload) => {
            console.log('Received realtime update for seats:', payload);
            fetchInitialData();
          }
        );
      }
      
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        (payload) => {
          console.log('Received realtime update for prompts:', payload);
          fetchInitialData();
        }
      );
      
      newChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('Received realtime update for announcements:', payload);
          fetchInitialData();
        }
      );

      newChannel
        .subscribe(async (status) => {
          console.log('Supabase realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates!');
            setRealtimeStatus('connected');
            await fetchInitialData();
          } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error('Supabase realtime subscription issue:', status);
            
            if (isGuestUser) {
              console.log('Guest user - keeping status as connected despite errors');
              setRealtimeStatus('connected');
            } else {
              setRealtimeStatus('error');
            }
            
            await fetchInitialData();
            
            setTimeout(() => {
              console.log('Attempting to reconnect realtime subscription...');
              setupRealtimeSubscriptions();
            }, 5000);
          }
        });
      
      setChannel(newChannel);
      
      return newChannel;
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
      setRealtimeStatus('error');
      return null;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentPollingInterval = isGuestUser ? 10000 : 20000;
      
      if (now - lastRefreshTime > currentPollingInterval) {
        console.log(`Polling for updates (${isGuestUser ? 'guest user' : 'regular user'})...`);
        fetchInitialData();
      }
    }, isGuestUser ? 10000 : 20000);

    return () => clearInterval(interval);
  }, [lastRefreshTime, user]);

  useEffect(() => {
    console.log('Initializing realtime updates...');
    
    fetchInitialData();
    
    const newChannel = setupRealtimeSubscriptions();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [user]);

  const refreshData = async () => {
    console.log('Manually refreshing data...');
    await fetchInitialData();
    return Promise.resolve();
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
