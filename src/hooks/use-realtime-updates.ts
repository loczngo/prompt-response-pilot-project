
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataFetcher } from './realtime/use-data-fetcher';
import { useRealtimeSubscriber } from './realtime/use-realtime-subscriber';
import { useRealtimeState } from './realtime/use-realtime-state';

export const useRealtimeUpdates = () => {
  const { user } = useAuth();

  const tableState = useRealtimeState({
    cacheKey: 'tables',
    initialState: []
  });

  const promptState = useRealtimeState({
    cacheKey: 'prompts',
    initialState: []
  });

  const announcementState = useRealtimeState({
    cacheKey: 'announcements',
    initialState: []
  });

  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  
  const tableFetcher = useDataFetcher('tables', 'tables');
  const promptFetcher = useDataFetcher('prompts', 'prompts');
  const announcementFetcher = useDataFetcher('announcements', 'announcements');

  const fetchAllData = async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      
      const shouldUseCache = user?.role === 'guest' && (
        tableState.data.length > 0 || 
        promptState.data.length > 0 || 
        announcementState.data.length > 0
      );
      
      if (shouldUseCache) {
        console.log('Guest user with existing data - using cached data as primary source');
        return;
      }

      const [tablesData, promptsData, announcementsData] = await Promise.all([
        tableFetcher.fetchData(),
        promptFetcher.fetchData(),
        announcementFetcher.fetchData()
      ]);

      tableState.setData(tablesData);
      promptState.setData(promptsData);
      announcementState.setData(announcementsData);
      
      setErrorCount(0);
      setRealtimeStatus('connected');
    } catch (error) {
      console.error('Error in fetchAllData:', error);
      setLastError(error);
      setErrorCount(prev => prev + 1);
      
      if (errorCount >= 3 && user?.role !== 'guest') {
        setRealtimeStatus('error');
      }
    } finally {
      tableState.setLoadingData(false);
      promptState.setLoadingData(false);
      announcementState.setLoadingData(false);
      tableState.setHasAttemptedFetch(true);
    }
  };

  // Set up realtime subscriptions for each table
  useRealtimeSubscriber('tables', fetchAllData);
  useRealtimeSubscriber('prompts', fetchAllData);
  useRealtimeSubscriber('announcements', fetchAllData);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Polling for updates
  useEffect(() => {
    const pollingInterval = user?.role === 'guest' ? 10000 : 20000;
    const interval = setInterval(fetchAllData, pollingInterval);
    return () => clearInterval(interval);
  }, [user]);

  const refreshData = async () => {
    console.log('Manually refreshing data...');
    await fetchAllData();
    return Promise.resolve();
  };

  return {
    tables: tableState.data,
    prompts: promptState.data,
    announcements: announcementState.data,
    realtimeStatus,
    refreshData,
    isInitialized: tableState.hasAttemptedFetch,
    lastError
  };
};
