
import { useState, useEffect } from 'react';
import { Prompt, getTables } from '@/lib/mockDb';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { text: string; targetTable: string | null; isActive: boolean }) => void;
  title: string;
  description: string;
  prompt?: Prompt;
  isTableAdmin?: boolean;
}

export const PromptDialog = ({
  open,
  onOpenChange,
  onSave,
  title,
  description,
  prompt,
  isTableAdmin
}: PromptDialogProps) => {
  const [promptText, setPromptText] = useState('');
  const [targetTable, setTargetTable] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const tables = getTables();

  useEffect(() => {
    if (prompt) {
      setPromptText(prompt.text);
      setTargetTable(prompt.targetTable !== null ? prompt.targetTable.toString() : null);
      setIsActive(prompt.status === 'active');
    }
  }, [prompt]);

  const handleSave = () => {
    const success = onSave({
      text: promptText,
      targetTable,
      isActive
    });
    
    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setPromptText('');
    setTargetTable(null);
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
            {isTableAdmin && (
              <p className="text-xs text-muted-foreground">
                As a Table Admin, prompts will be automatically targeted to your assigned table.
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
