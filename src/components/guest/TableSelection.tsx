
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
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to manually refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    if (selectedTable) {
      await fetchSeats(parseInt(selectedTable, 10));
    }
    setRefreshing(false);
    
    toast({
      title: "Data refreshed",
      description: "Latest table and seat information loaded",
    });
  };

  // Fetch tables with improved error handling
  const fetchTables = async () => {
    console.log('Fetching tables...');
    setLoadingData(true);
    
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching tables:', error);
        
        // For permission denied errors, we'll use a fallback approach
        // Check for 403 error using error.code instead of error.status
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log('Permission denied for tables, using fallback approach');
          toast({
            title: "Limited data access",
            description: "Using available data. Some features may be restricted.",
            variant: "default"
          });
        } else {
          toast({
            title: "Error fetching tables",
            description: "Please try refreshing the data",
            variant: "destructive"
          });
        }
      }

      console.log('Tables fetched:', data);
      if (data && Array.isArray(data)) {
        setTables(data);
      }
    } catch (err) {
      console.error('Unexpected error in fetchTables:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch seats when a table is selected with improved error handling
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
        
        // For permission denied errors, we'll show a user-friendly message
        // Check for 403 error using error.code instead of error.status
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log('Permission denied for seats, using fallback approach');
          toast({
            title: "Limited seat data access",
            description: "Try refreshing to see available seats",
            variant: "default"
          });
        } else {
          toast({
            title: "Error fetching seats",
            description: "Please try selecting a different table",
            variant: "destructive"
          });
        }
      }

      console.log('Seats fetched:', data);
      if (data && Array.isArray(data)) {
        setAvailableSeats(data.map(seat => seat.code) || []);
      } else {
        setAvailableSeats([]);
      }
    } catch (err) {
      console.error('Unexpected error in fetchSeats:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Initial data fetch and setup realtime subscription
  useEffect(() => {
    fetchTables();
    
    // Set up real-time subscription for table updates
    const channel = supabase
      .channel('public:tables')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload: any) => {
          console.log('Table change detected:', payload);
          fetchTables();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status (tables):', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fetch seats when a table is selected and setup realtime for seats
  useEffect(() => {
    if (!selectedTable) {
      setAvailableSeats([]);
      return;
    }

    const tableId = parseInt(selectedTable, 10);
    fetchSeats(tableId);

    // Set up real-time subscription for seat updates
    const channel = supabase
      .channel(`public:seats:table_${tableId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats', filter: `table_id=eq.${tableId}` },
        (payload: any) => {
          console.log('Seat change detected for this table:', payload);
          fetchSeats(tableId);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status (seats table ${tableId}):`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTable, toast]);

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
        .single();

      if (checkError || !seatCheck) {
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

      if (updateError) throw updateError;

      // Update the seat
      const { error: seatError } = await supabase
        .from('seats')
        .update({ user_id: user.id })
        .eq('table_id', tableId)
        .eq('code', selectedSeat);

      if (seatError) throw seatError;

      toast({
        title: "Table Joined",
        description: `You've been assigned to Table ${selectedTable}, Seat ${selectedSeat}`,
      });

      // Refresh user context to reflect new table assignment
      // This assumes there's a method to refresh the user context
      // If not, you might need to add one or handle this differently
      
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
    logout(); // Log out the user to return to the role selection screen
    navigate('/'); // Navigate back to the main page
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
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table">Table Number</Label>
            <Select
              value={selectedTable}
              onValueChange={setSelectedTable}
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
