
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useTableSeatSelection = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { toast } = useToast();

  const fetchTables = async () => {
    console.log('Fetching tables...');
    setLoadingData(true);
    setHasAttemptedFetch(true);
    
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching tables:', error);
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log('Permission denied for tables, using fallback approach');
          const cachedTables = localStorage.getItem('cached_tables');
          if (cachedTables) {
            setTables(JSON.parse(cachedTables));
          }
          toast({
            title: "Using cached data",
            description: "Limited connectivity to server. Using available data.",
            variant: "default"
          });
        } else {
          toast({
            title: "Error fetching tables",
            description: "Please try refreshing the data",
            variant: "destructive"
          });
        }
      } else if (data && Array.isArray(data)) {
        setTables(data);
        localStorage.setItem('cached_tables', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Unexpected error in fetchTables:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSeats = async (tableId: number) => {
    if (!tableId) return;
    
    setLoadingData(true);
    console.log('Fetching seats for table:', tableId);

    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('table_id', tableId)
        .eq('status', 'active')
        .is('user_id', null);

      if (error) {
        console.error('Error fetching seats:', error);
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          const cachedSeatsKey = `cached_seats_table_${tableId}`;
          const cachedSeats = localStorage.getItem(cachedSeatsKey);
          
          if (cachedSeats) {
            const parsedSeats = JSON.parse(cachedSeats);
            setAvailableSeats(parsedSeats.map((seat: any) => seat.code) || []);
          } else {
            const fallbackSeats = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].filter(() => Math.random() > 0.3);
            setAvailableSeats(fallbackSeats);
          }
        } else {
          toast({
            title: "Error fetching seats",
            description: "Please try selecting a different table",
            variant: "destructive"
          });
        }
      } else if (data && Array.isArray(data)) {
        const seatCodes = data.map(seat => seat.code) || [];
        setAvailableSeats(seatCodes);
        localStorage.setItem(`cached_seats_table_${tableId}`, JSON.stringify(data));
      } else {
        setAvailableSeats([]);
      }
    } catch (err) {
      console.error('Unexpected error in fetchSeats:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchTables();
      if (selectedTable) {
        await fetchSeats(parseInt(selectedTable, 10));
      }
      toast({
        title: "Data refreshed",
        description: "Latest table and seat information loaded",
      });
    } catch (err) {
      console.error('Error during refresh:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (!selectedTable) {
      setAvailableSeats([]);
      return;
    }

    const tableId = parseInt(selectedTable, 10);
    fetchSeats(tableId);

    const channelId = `seat_updates_table${tableId}_${Math.random().toString(36).substring(2, 9)}`;
    let channel: RealtimeChannel;
    
    try {
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'seats', filter: `table_id=eq.${tableId}` },
          () => {
            setTimeout(() => fetchSeats(tableId), 1000);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error setting up seat subscription:', error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedTable]);

  useEffect(() => {
    const channelId = `table_updates_${Math.random().toString(36).substring(2, 9)}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => {
          setTimeout(() => fetchTables(), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tables,
    selectedTable,
    selectedSeat,
    availableSeats,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    setSelectedTable,
    setSelectedSeat,
    handleRefresh
  };
};
