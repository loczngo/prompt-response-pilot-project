
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTables } from '@/lib/mockDb';
import { useSharedState } from '@/hooks/use-shared-state';

const GuestLogin = ({ onBack }: { onBack: () => void }) => {
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [seatCode, setSeatCode] = useState('');
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [activeTables, setActiveTables] = useSharedState<number[]>('activeTables', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginGuest } = useAuth();
  const { toast } = useToast();

  // Load active tables when component mounts and periodically refresh
  useEffect(() => {
    // Get all active tables
    const refreshActiveTables = () => {
      const tables = getTables();
      const activeTableIds = tables
        .filter(table => table.status === 'active')
        .map(table => table.id);
      
      setActiveTables(activeTableIds);
      
      // Set a default table if one exists and none is selected
      if (activeTableIds.length > 0 && !tableNumber) {
        setTableNumber(activeTableIds[0].toString());
      }
    };
    
    // Refresh immediately and then every 1 second for more responsive updates
    refreshActiveTables();
    const interval = setInterval(refreshActiveTables, 1000);
    
    return () => clearInterval(interval);
  }, [tableNumber, setActiveTables]);

  // Update available seats when table selection changes
  useEffect(() => {
    if (tableNumber) {
      const updateAvailableSeats = () => {
        const tables = getTables();
        const selectedTable = tables.find(t => t.id === parseInt(tableNumber));
        const seats = selectedTable?.seats
          .filter(seat => seat.status === 'available' && !seat.userId)
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
      };
      
      updateAvailableSeats();
      
      // Set up interval to refresh available seats
      const interval = setInterval(updateAvailableSeats, 1000);
      
      return () => clearInterval(interval);
    }
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
      // Split name into first and last name (use whole name as first name if no space)
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Use the loginGuest method with proper arguments
      await loginGuest(parseInt(tableNumber), seatCode);
      
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
        
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !name || !tableNumber || !seatCode}
          >
            {loading ? 'Joining...' : 'Join Table'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GuestLogin;
