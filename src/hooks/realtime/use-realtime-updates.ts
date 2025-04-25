
import { useEffect, useCallback, useState } from 'react';
import { useSharedState } from '../use-shared-state';
import { useRealtimeChannel } from './use-realtime-channel';
import { useDataFetching } from './use-data-fetching';

export const useRealtimeUpdates = () => {
  const [tables, setTables] = useSharedState<any[]>('tables', []);
  const [prompts, setPrompts] = useSharedState<any[]>('prompts', []);
  const [announcements, setAnnouncements] = useSharedState<any[]>('announcements', []);
  const [isPolling, setIsPolling] = useState(false);
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
    
    // Setup realtime channel - pass the refresh function directly
    const channel = setupChannel(refreshData);
    
    // Set up polling as a fallback with better management
    let pollingInterval: number | null = null;
    
    const startPolling = () => {
      if (!isPolling) {
        console.log('Starting polling mechanism as fallback');
        setIsPolling(true);
        pollingInterval = window.setInterval(() => {
          if (realtimeStatus !== 'connected') {
            console.log('Polling for updates as realtime connection is not active');
            refreshData();
          }
        }, 10000); // Poll every 10 seconds if realtime is not working
      }
    };
    
    const stopPolling = () => {
      if (pollingInterval) {
        console.log('Stopping polling mechanism');
        window.clearInterval(pollingInterval);
        pollingInterval = null;
        setIsPolling(false);
      }
    };
    
    // Start or stop polling based on realtime status
    if (realtimeStatus !== 'connected') {
      startPolling();
    } else {
      stopPolling();
    }
    
    // Cleanup on unmount
    return () => {
      stopPolling();
      cleanup();
    };
  }, [refreshData, setupChannel, cleanup, realtimeStatus, isPolling]);

  return {
    tables,
    prompts,
    announcements,
    realtimeStatus,
    refreshData
  };
};
