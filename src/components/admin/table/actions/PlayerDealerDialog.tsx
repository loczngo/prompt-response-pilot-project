
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, User, getUsers } from '@/lib/mockDb';

interface PlayerDealerDialogProps {
  selectedTable: Table;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerDealerSelect: (seatCode: string) => void;
}

export const PlayerDealerDialog = ({
  selectedTable,
  open,
  onOpenChange,
  onPlayerDealerSelect,
}: PlayerDealerDialogProps) => {
  const eligibleSeats = selectedTable.seats
    .filter(seat => seat.status === 'active' && seat.userId && !seat.isDealer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Player-Dealer Inquiry</DialogTitle>
          <DialogDescription>
            Select a seat to query for Player-Dealer role
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {eligibleSeats.map(seat => {
              const user = getUsers().find(u => u.id === seat.userId);
              
              return (
                <Button
                  key={seat.code}
                  variant="outline"
                  className="p-4 h-auto"
                  onClick={() => {
                    onPlayerDealerSelect(seat.code);
                    onOpenChange(false);
                  }}
                >
                  <div className="text-center">
                    <div className="font-medium">Seat {seat.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {eligibleSeats.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              No eligible seats available. Seats must be active and occupied.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
