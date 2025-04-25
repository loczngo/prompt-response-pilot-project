
import { useState, useEffect } from 'react';
import { Prompt, getTables } from '@/lib/mockDb';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { text: string; targetTable: string | null; isActive: boolean }) => Promise<boolean> | boolean | void;
  title: string;
  description: string;
  prompt?: Prompt;
  isTableAdmin?: boolean;
  tableNumber?: number;
}

export const PromptDialog = ({
  open,
  onOpenChange,
  onSave,
  title,
  description,
  prompt,
  isTableAdmin,
  tableNumber
}: PromptDialogProps) => {
  const [promptText, setPromptText] = useState('');
  const [targetTable, setTargetTable] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();
  
  const tables = getTables();

  useEffect(() => {
    if (prompt) {
      setPromptText(prompt.text);
      setTargetTable(prompt.targetTable !== null ? prompt.targetTable.toString() : null);
      setIsActive(prompt.status === 'active');
    } else if (isTableAdmin && tableNumber) {
      setTargetTable(tableNumber.toString());
    }
  }, [prompt, isTableAdmin, tableNumber]);

  const handleSave = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Validation Error",
        description: "Prompt text cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onSave({
        text: promptText,
        targetTable,
        isActive
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "There was a problem saving the prompt",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setPromptText('');
    setTargetTable(isTableAdmin && tableNumber ? tableNumber.toString() : null);
    setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-text">Prompt Text</Label>
            <Input
              id="prompt-text"
              placeholder="Enter prompt question"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-table">Target Table</Label>
            <Select
              value={targetTable === null ? 'all' : targetTable}
              onValueChange={(value) => setTargetTable(value === 'all' ? null : value)}
              disabled={isTableAdmin}
            >
              <SelectTrigger id="target-table">
                <SelectValue placeholder="Select target table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id.toString()}>
                    Table {table.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isTableAdmin && tableNumber && (
              <p className="text-xs text-muted-foreground">
                As a Table Admin, your prompts will be automatically targeted to Table {tableNumber}.
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active-status"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active-status">Active</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
