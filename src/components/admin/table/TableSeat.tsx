
import { Seat, getUsers } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, UserMinus } from 'lucide-react';

interface TableSeatProps {
  tableId: number;
  seat: Seat;
  onToggleStatus: (seatCode: string) => void;
  onRemoveUser?: (seatCode: string) => void;
}

export const TableSeat = ({ tableId, seat, onToggleStatus, onRemoveUser }: TableSeatProps) => {
  // Get user information directly from the users list
  const user = seat.userId ? getUsers().find(u => u.id === seat.userId) : undefined;
  const isOccupied = !!seat.userId;

  return (
    <div 
      className={`p-3 rounded-md border ${
        seat.status === 'active' 
          ? 'bg-accent border-primary/30' 
          : 'bg-muted border-muted'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
            seat.status === 'active' 
              ? seat.isDealer 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent-foreground/10 text-accent-foreground' 
              : 'bg-muted-foreground/20 text-muted-foreground'
          }`}>
            {seat.code}
          </div>
          <div>
            <p className="font-medium">
              Seat {seat.code}
              {seat.isDealer && (
                <span className="ml-2 text-xs bg-primary/20 text-primary-foreground px-2 py-1 rounded-full">
                  Dealer ({seat.dealerHandsLeft} hands left)
                </span>
              )}
            </p>
            {user ? (
              <p className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Not occupied
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isOccupied && onRemoveUser && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onRemoveUser(seat.code)}
              title="Remove user from seat"
            >
              <UserMinus className="h-4 w-4 text-amber-500" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleStatus(seat.code)}
            title={seat.status === 'active' ? 'Deactivate seat' : 'Activate seat'}
          >
            {seat.status === 'active' ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
