
import { useEffect, useCallback } from 'react';
import { useSharedState } from '../use-shared-state';
import { useRealtimeChannel } from './use-realtime-channel';
import { useDataFetching } from './use-data-fetching';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const { realtimeStatus, setupChannel, cleanup } = useRealtimeChannel();
  const { fetchData } = useDataFetching();

  const refreshData = useCallback(async () => {
    console.log('Manually refreshing data...');
    const { tablesData, promptsData, announcementsData } = await fetchData();
    
    if (tablesData) setTables(tablesData);
    if (promptsData) setPrompts(promptsData);
    if (announcementsData) setAnnouncements(announcementsData);
  }, [fetchData, setTables, setPrompts, setAnnouncements]);

  // Initial data fetch and realtime setup
  useEffect(() => {
    console.log('Initializing realtime updates and fallback polling...');
    
    // Initial data fetch
    refreshData();
    
    // Setup realtime channel
    const channel = setupChannel(refreshData);
    
    // Set up polling as a fallback
    const pollingInterval = setInterval(() => {
      if (realtimeStatus !== 'connected') {
        console.log('Polling for updates as realtime connection is not active');
        refreshData();
      }
    }, 10000); // Poll every 10 seconds if realtime is not working
    
    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
      cleanup();
    };
  }, [refreshData, setupChannel, cleanup, realtimeStatus]);

  return {
    tables,
    prompts,
    announcements,
    realtimeStatus,
    refreshData
  };
};
