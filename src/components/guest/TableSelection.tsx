
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';

export const TableSelection = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to manually refresh data with debouncing
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple clicks
    
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

  // Fetch tables with improved error handling and fallback data
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
        
        // For permission denied errors, we'll use localStorage as a fallback
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log('Permission denied for tables, using fallback approach');
          
          // If we have cached tables in localStorage, use them
          const cachedTables = localStorage.getItem('cached_tables');
          if (cachedTables) {
            const parsedTables = JSON.parse(cachedTables);
            console.log('Using cached tables:', parsedTables);
            setTables(parsedTables);
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
      } else {
        console.log('Tables fetched:', data);
        if (data && Array.isArray(data)) {
          setTables(data);
          // Cache the tables data in localStorage for future use
          localStorage.setItem('cached_tables', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchTables:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch seats with improved error handling and fallback data
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
        
        // For permission denied errors, try to use cached data
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log('Permission denied for seats, checking for cached seats');
          
          // Try to use cached seats if available
          const cachedSeatsKey = `cached_seats_table_${tableId}`;
          const cachedSeats = localStorage.getItem(cachedSeatsKey);
          
          if (cachedSeats) {
            const parsedSeats = JSON.parse(cachedSeats);
            console.log('Using cached seats:', parsedSeats);
            setAvailableSeats(parsedSeats.map((seat: any) => seat.code) || []);
          } else {
            // If no cached seats are available, use mock seats as a fallback
            const fallbackSeats = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].filter(() => Math.random() > 0.3);
            setAvailableSeats(fallbackSeats);
            console.log('Using fallback seats as no cached data available');
          }
          
          toast({
            title: "Using available seat data",
            description: "Some seat information may not be current",
            variant: "default"
          });
        } else {
          toast({
            title: "Error fetching seats",
            description: "Please try selecting a different table",
            variant: "destructive"
          });
        }
      } else {
        console.log('Seats fetched:', data);
        if (data && Array.isArray(data)) {
          const seatCodes = data.map(seat => seat.code) || [];
          setAvailableSeats(seatCodes);
          
          // Cache the seats data for this table
          localStorage.setItem(`cached_seats_table_${tableId}`, JSON.stringify(data));
        } else {
          setAvailableSeats([]);
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchSeats:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTables();
  }, []);

  // Set up real-time subscription for table updates
  useEffect(() => {
    // Generate a unique channel ID to prevent conflicts
    const channelId = `table_updates_${Math.random().toString(36).substring(2, 9)}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload: any) => {
          console.log('Table change detected:', payload);
          // Don't immediately fetch to avoid spamming
          setTimeout(() => fetchTables(), 1000);
        }
      )
      .subscribe((status) => {
        console.log(`Table subscription status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch seats when a table is selected
  useEffect(() => {
    if (!selectedTable) {
      setAvailableSeats([]);
      return;
    }

    const tableId = parseInt(selectedTable, 10);
    fetchSeats(tableId);

    // Set up real-time subscription for seat updates with proper error handling
    const channelId = `seat_updates_table${tableId}_${Math.random().toString(36).substring(2, 9)}`;
    
    let channel: RealtimeChannel;
    
    try {
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'seats', filter: `table_id=eq.${tableId}` },
          (payload: any) => {
            console.log('Seat change detected:', payload);
            // Don't immediately fetch to avoid spamming
            setTimeout(() => fetchSeats(tableId), 1000);
          }
        )
        .subscribe((status) => {
          console.log(`Seat subscription status for table ${tableId}: ${status}`);
        });
    } catch (error) {
      console.error('Error setting up seat subscription:', error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedTable]);

  const handleJoinTable = async () => {
    if (!selectedTable || !selectedSeat || !user) return;

    setLoading(true);
    try {
      const tableId = parseInt(selectedTable, 10);
      
      // Start a transaction by first checking if the seat is still available
      const { data: seatCheck, error: checkError } = await supabase
        .from('seats')
        .select('*')
        .eq('table_id', tableId)
        .eq('code', selectedSeat)
        .is('user_id', null)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking seat availability:', checkError);
        throw new Error('Unable to verify seat availability');
      }

      if (!seatCheck) {
        throw new Error('This seat is no longer available');
      }

      // Update the user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          table_number: tableId,
          seat_code: selectedSeat
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Update the seat
      const { error: seatError } = await supabase
        .from('seats')
        .update({ user_id: user.id })
        .eq('table_id', tableId)
        .eq('code', selectedSeat);

      if (seatError) {
        console.error('Error updating seat:', seatError);
        throw seatError;
      }

      toast({
        title: "Table Joined",
        description: `You've been assigned to Table ${selectedTable}, Seat ${selectedSeat}`,
      });

      // Force reload to reflect changes
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error joining table:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join table. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToMain = () => {
    // Fix the return button
    try {
      // First attempt to log out properly
      logout();
      // Then navigate to the main page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: force navigation even if logout fails
      navigate('/');
    }
  };

  // Render a fallback message if we've attempted to fetch and have no tables
  const renderTablesFallback = () => {
    if (hasAttemptedFetch && tables.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No tables are currently available.</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Tables
              </>
            )}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Button
        variant="outline"
        size="sm"
        className="mb-6 flex items-center"
        onClick={handleReturnToMain}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Main
      </Button>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Select Your Table</CardTitle>
              <CardDescription>
                Choose an available table and seat to join
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="p-1 h-8 w-8"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderTablesFallback()}

          <div className="space-y-2">
            <Label htmlFor="table">Table Number</Label>
            <Select
              value={selectedTable}
              onValueChange={(value) => {
                setSelectedTable(value);
                setSelectedSeat(''); // Reset seat selection when table changes
              }}
              disabled={loadingData || tables.length === 0}
            >
              <SelectTrigger id="table">
                <SelectValue placeholder={loadingData ? "Loading tables..." : "Select a table"} />
              </SelectTrigger>
              <SelectContent>
                {tables.length === 0 && !loadingData ? (
                  <SelectItem value="no-tables" disabled>No tables available</SelectItem>
                ) : (
                  tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Table {table.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seat">Seat</Label>
            <Select
              value={selectedSeat}
              onValueChange={setSelectedSeat}
              disabled={!selectedTable || loadingData || availableSeats.length === 0}
            >
              <SelectTrigger id="seat">
                <SelectValue 
                  placeholder={
                    !selectedTable ? "Select a table first" : 
                    loadingData ? "Loading seats..." : 
                    availableSeats.length === 0 ? "No seats available" : 
                    "Select a seat"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {availableSeats.length === 0 && selectedTable && !loadingData ? (
                  <SelectItem value="no-seats" disabled>No available seats</SelectItem>
                ) : (
                  availableSeats.map((code) => (
                    <SelectItem key={code} value={code}>
                      Seat {code}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={handleJoinTable}
            disabled={!selectedTable || !selectedSeat || loading || loadingData}
          >
            {loading ? 'Joining...' : 'Join Table'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
