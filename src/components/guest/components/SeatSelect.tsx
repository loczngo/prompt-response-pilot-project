
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SeatSelectProps {
  selectedTable: string;
  selectedSeat: string;
  availableSeats: string[];
  onSeatSelect: (value: string) => void;
  loadingData: boolean;
}

export const SeatSelect = ({ 
  selectedTable, 
  selectedSeat, 
  availableSeats, 
  onSeatSelect, 
  loadingData 
}: SeatSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="seat">Seat</Label>
      <Select
        value={selectedSeat}
        onValueChange={onSeatSelect}
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
  );
};
