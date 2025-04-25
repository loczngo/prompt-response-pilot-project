
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TableSelection = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    const interval = setInterval(fetchTables, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedTable) return;

      const tableId = parseInt(selectedTable, 10);

      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('table_id', tableId)
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
      const tableId = parseInt(selectedTable, 10);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          table_number: tableId,
          seat_code: selectedSeat
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

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
    </div>
  );
};

