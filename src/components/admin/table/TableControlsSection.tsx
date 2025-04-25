
import { useState, useEffect } from 'react';
import { Table } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';

interface TableControlsSectionProps {
  selectedTable: Table;
  selectedPromptId: string;
  onPromptSelect: (value: string) => void;
  onSendPrompt: () => void;
}

export const TableControlsSection = ({
  selectedTable,
  selectedPromptId,
  onPromptSelect,
  onSendPrompt,
}: TableControlsSectionProps) => {
  // Use the realtime prompts data from useRealtimeUpdates
  const { prompts } = useRealtimeUpdates();
  const [currentPromptText, setCurrentPromptText] = useState<string | undefined>('');
  
  // Filter prompts that are active and applicable to this table
  const activePrompts = prompts
    .filter(p => p.status === 'active' && (p.target_table === null || p.target_table === selectedTable.id));
  
  // Update current prompt text when selected table changes or when prompts update
  useEffect(() => {
    // Find the current prompt for this table
    if (selectedTable.currentPromptId) {
      const currentPrompt = prompts.find(p => p.id === selectedTable.currentPromptId);
      setCurrentPromptText(currentPrompt?.text);
    } else {
      setCurrentPromptText(undefined);
    }
  }, [selectedTable, prompts]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Prompt Control</CardTitle>
        <CardDescription>
          Send prompts to the table
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-select">Select Prompt</Label>
            <Select
              value={selectedPromptId}
              onValueChange={onPromptSelect}
            >
              <SelectTrigger id="prompt-select">
                <SelectValue placeholder="Select prompt" />
              </SelectTrigger>
              <SelectContent>
                {activePrompts.length === 0 ? (
                  <SelectItem value="no-prompts" disabled>No active prompts available</SelectItem>
                ) : (
                  activePrompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.text}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            className="w-full"
            disabled={!selectedPromptId}
            onClick={onSendPrompt}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Prompt
          </Button>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Current Prompt</h3>
            {selectedTable.currentPromptId ? (
              <div className="p-3 bg-accent rounded-md border border-primary/30">
                {currentPromptText || 'Unknown prompt'}
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-md text-muted-foreground">
                No active prompt
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
