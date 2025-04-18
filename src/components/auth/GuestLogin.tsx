
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTables } from '@/lib/mockDb';

type GuestLoginProps = {
  onBack: () => void;
};

const GuestLogin = ({ onBack }: GuestLoginProps) => {
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [seatCode, setSeatCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginGuest } = useAuth();
  
  // Get available tables
  const tables = getTables().filter(table => table.status === 'active');
  
  // Get available seats for selected table
  const getAvailableSeats = () => {
    if (!tableNumber) return [];
    
    const selectedTable = tables.find(t => t.id === Number(tableNumber));
    if (!selectedTable) return [];
    
    return selectedTable.seats.filter(seat => 
      seat.status === 'active' && !seat.userId
    );
  };
  
  const availableSeats = getAvailableSeats();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tableNumber || !seatCode) return;
    
    setIsSubmitting(true);
    try {
      await loginGuest(name, Number(tableNumber), seatCode);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Join as Guest</CardTitle>
              <CardDescription>Enter your details to join a table</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="table-number" className="text-sm font-medium">
                Table Number
              </label>
              <Select
                value={tableNumber}
                onValueChange={(value) => {
                  setTableNumber(value);
                  setSeatCode(''); // Reset seat selection
                }}
              >
                <SelectTrigger id="table-number">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.length === 0 ? (
                    <SelectItem value="no-tables" disabled>No active tables available</SelectItem>
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
              <label htmlFor="seat-code" className="text-sm font-medium">
                Seat
              </label>
              <Select
                value={seatCode}
                onValueChange={setSeatCode}
                disabled={!tableNumber || availableSeats.length === 0}
              >
                <SelectTrigger id="seat-code">
                  <SelectValue placeholder="Select seat" />
                </SelectTrigger>
                <SelectContent>
                  {!tableNumber ? (
                    <SelectItem value="select-table-first" disabled>Select a table first</SelectItem>
                  ) : availableSeats.length === 0 ? (
                    <SelectItem value="no-seats" disabled>No available seats</SelectItem>
                  ) : (
                    availableSeats.map((seat) => (
                      <SelectItem key={seat.code} value={seat.code}>
                        Seat {seat.code}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !name || !tableNumber || !seatCode}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Table'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default GuestLogin;
