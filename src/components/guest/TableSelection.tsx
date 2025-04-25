
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const TableSelection = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch active tables
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching tables:', error);
        return;
      }

      setTables(data || []);
    };

    fetchTables();
    const interval = setInterval(fetchTables, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch available seats when table is selected
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedTable) return;

      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('table_id', selectedTable)
        .eq('status', 'active')
        .is('user_id', null);

      if (error) {
        console.error('Error fetching seats:', error);
        return;
      }

      setAvailableSeats(data?.map(seat => seat.code) || []);
    };

    fetchSeats();
  }, [selectedTable]);

  const handleJoinTable = async () => {
    if (!selectedTable || !selectedSeat || !user) return;

    setLoading(true);
    try {
      // Update profile with table and seat
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          table_number: parseInt(selectedTable),
          seat_code: selectedSeat
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update seat with user id
      const { error: seatError } = await supabase
        .from('seats')
        .update({ user_id: user.id })
        .eq('table_id', selectedTable)
        .eq('code', selectedSeat);

      if (seatError) throw seatError;

      toast({
        title: "Table Joined",
        description: `You've been assigned to Table ${selectedTable}, Seat ${selectedSeat}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select Your Table</CardTitle>
        <CardDescription>
          Choose an available table and seat to join
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="table">Table Number</Label>
          <Select
            value={selectedTable}
            onValueChange={setSelectedTable}
          >
            <SelectTrigger id="table">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id.toString()}>
                  Table {table.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seat">Seat</Label>
          <Select
            value={selectedSeat}
            onValueChange={setSelectedSeat}
            disabled={!selectedTable || availableSeats.length === 0}
          >
            <SelectTrigger id="seat">
              <SelectValue placeholder="Select a seat" />
            </SelectTrigger>
            <SelectContent>
              {availableSeats.map((code) => (
                <SelectItem key={code} value={code}>
                  Seat {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleJoinTable}
          disabled={!selectedTable || !selectedSeat || loading}
        >
          {loading ? 'Joining...' : 'Join Table'}
        </Button>
      </CardFooter>
    </Card>
  );
};
