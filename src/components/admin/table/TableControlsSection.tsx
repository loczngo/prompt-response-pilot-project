
import { useState, useEffect } from 'react';
import { Table, getPrompts } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';

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
  const [activePrompts, setActivePrompts] = useState<ReturnType<typeof getPrompts>>([]);
  const [currentPromptText, setCurrentPromptText] = useState<string | undefined>('');
  
  // Periodically refresh prompts and current prompt display
  useEffect(() => {
    const updatePrompts = () => {
      const prompts = getPrompts().filter(p => 
        p.status === 'active' && 
        (p.targetTable === null || p.targetTable === selectedTable.id)
      );
      setActivePrompts(prompts);
      
      // Update current prompt text
      if (selectedTable.currentPromptId) {
        const currentPrompt = getPrompts().find(p => p.id === selectedTable.currentPromptId);
        setCurrentPromptText(currentPrompt?.text);
      } else {
        setCurrentPromptText(undefined);
      }
    };
    
    // Update immediately and then every 2 seconds
    updatePrompts();
    const interval = setInterval(updatePrompts, 2000);
    
    return () => clearInterval(interval);
  }, [selectedTable]);

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
