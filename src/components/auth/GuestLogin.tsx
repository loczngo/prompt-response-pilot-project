
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTables } from '@/lib/mockDb';

const GuestLogin = () => {
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [seatCode, setSeatCode] = useState('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [activeTables, setActiveTables] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginAsGuest } = useAuth();
  const { toast } = useToast();

  // Load active tables when component mounts
  useEffect(() => {
    // Get all active tables
    const tables = getTables();
    const activeTableIds = tables
      .filter(table => table.status === 'active')
      .map(table => table.id);
    
    setActiveTables(activeTableIds);
    
    // Set a default table if one exists
    if (activeTableIds.length > 0) {
      setTableNumber(activeTableIds[0].toString());
    }
    
    // Update available seats whenever active tables change
    const refreshAvailableSeats = () => {
      if (tableNumber) {
        const selectedTable = tables.find(t => t.id === parseInt(tableNumber));
        const seats = selectedTable?.seats
          .filter(seat => seat.status === 'active' && !seat.userId)
          .map(seat => seat.code) || [];
        
        setAvailableSeats(seats);
        
        // Clear seat selection if the currently selected seat is no longer available
        if (seatCode && !seats.includes(seatCode)) {
          setSeatCode('');
        }
        
        // If seats are available and none is selected, select the first one
        if (seats.length > 0 && !seatCode) {
          setSeatCode(seats[0]);
        }
      }
    };
    
    refreshAvailableSeats();
    
    // Set up interval to refresh available seats
    const interval = setInterval(refreshAvailableSeats, 2000);
    
    return () => clearInterval(interval);
  }, [tableNumber, seatCode]);

  // Update available seats when table selection changes
  const handleTableChange = (value: string) => {
    setTableNumber(value);
    setSeatCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!tableNumber) {
      setError('Please select a table');
      return;
    }
    
    if (!seatCode) {
      setError('Please select a seat');
      return;
    }
    
    setLoading(true);
    
    try {
      await loginAsGuest(name, parseInt(tableNumber), seatCode);
      toast({
        title: "Login Successful",
        description: `Welcome to Table ${tableNumber}, Seat ${seatCode}!`,
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to log in. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Guest Login</CardTitle>
          <CardDescription>
            Enter your details to join a table
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="table">Table Number</Label>
            <Select value={tableNumber} onValueChange={handleTableChange}>
              <SelectTrigger id="table">
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {activeTables.length > 0 ? (
                  activeTables.map((id) => (
                    <SelectItem key={id} value={id.toString()}>
                      Table {id}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No active tables available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seat">Seat</Label>
            <Select value={seatCode} onValueChange={setSeatCode} disabled={!tableNumber}>
              <SelectTrigger id="seat">
                <SelectValue placeholder="Select a seat" />
              </SelectTrigger>
              <SelectContent>
                {availableSeats.length > 0 ? (
                  availableSeats.map((code) => (
                    <SelectItem key={code} value={code}>
                      Seat {code}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No available seats
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <div className="text-sm font-medium text-destructive">
              {error}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || !name || !tableNumber || !seatCode}>
            {loading ? 'Joining...' : 'Join Table'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GuestLogin;
