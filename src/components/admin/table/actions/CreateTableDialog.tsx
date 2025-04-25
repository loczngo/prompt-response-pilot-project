
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTable: (seats: number) => void;
}

export const CreateTableDialog = ({
  open,
  onOpenChange,
  onCreateTable,
}: CreateTableDialogProps) => {
  const [newTableSeats, setNewTableSeats] = useState<number>(6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>
            Create a new table by specifying the number of seats.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="seats">Number of Seats</Label>
            <Input
              id="seats"
              type="number"
              min={2}
              max={12}
              value={newTableSeats}
              onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 6)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onCreateTable(newTableSeats)}>Create Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
