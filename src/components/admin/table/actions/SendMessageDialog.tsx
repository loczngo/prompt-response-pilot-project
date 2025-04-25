
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SendMessageDialogProps {
  tableId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMessage: (message: string) => void;
}

export const SendMessageDialog = ({
  tableId,
  open,
  onOpenChange,
  onSendMessage,
}: SendMessageDialogProps) => {
  const [tableMessage, setTableMessage] = useState('');

  const handleSendMessage = () => {
    onSendMessage(tableMessage);
    setTableMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message to Table {tableId}</DialogTitle>
          <DialogDescription>
            This message will be displayed to all players at the table.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="table-message">Message</Label>
            <Input
              id="table-message"
              placeholder="Enter your message..."
              value={tableMessage}
              onChange={(e) => setTableMessage(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={!tableMessage}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
