
import { useState, useEffect } from 'react';
import { Table, getPrompts } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { useSharedState } from '@/hooks/use-shared-state';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupabasePrompt, convertSupabasePromptToPrompt } from '@/types/table';

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
  // Use shared state for active prompts to sync across tabs
  const [activePrompts, setActivePrompts] = useSharedState<ReturnType<typeof getPrompts>>('activePrompts', []);
  const [currentPromptText, setCurrentPromptText] = useState<string | undefined>('');
  const { toast } = useToast();
  
  // Periodically refresh prompts and current prompt display
  useEffect(() => {
    const updatePrompts = async () => {
      try {
        // Fetch active prompts from Supabase
        const { data: prompts, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('status', 'active')
          .or(`target_table.is.null,target_table.eq.${selectedTable.id}`);
        
        if (error) {
          console.error('Error fetching prompts:', error);
          return;
        }

        if (prompts) {
          // Convert the Supabase prompts to local Prompt type
          const convertedPrompts = prompts.map(convertSupabasePromptToPrompt);
          setActivePrompts(convertedPrompts);
          
          // Update current prompt text if table has a prompt assigned
          if (selectedTable.currentPromptId) {
            const currentPrompt = prompts.find(p => p.id === selectedTable.currentPromptId);
            setCurrentPromptText(currentPrompt?.text || 'Unknown prompt');
          } else {
            setCurrentPromptText(undefined);
          }
        }
      } catch (error) {
        console.error('Error in updatePrompts:', error);
      }
    };
    
    // Update immediately and then every 1 second for more responsive updates
    updatePrompts();
    const interval = setInterval(updatePrompts, 1000);
    
    return () => clearInterval(interval);
  }, [selectedTable, setActivePrompts]);

  // Enhanced send prompt function
  const handleSendPrompt = async () => {
    if (!selectedTable || !selectedPromptId) return;
    
    try {
      // Update the table in Supabase with the current prompt ID
      const { error } = await supabase
        .from('tables')
        .update({ 
          status: selectedTable.status,  // Keep existing status
          current_prompt_id: selectedPromptId  // Add the current_prompt_id
        })
        .eq('id', selectedTable.id);
        
      if (error) {
        console.error('Error updating table with prompt:', error);
        toast({
          title: "Error",
          description: "Failed to send prompt to table.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Prompt Sent",
        description: "The prompt has been sent to the table.",
      });
      
      // Call the original handler to maintain compatibility
      onSendPrompt();
    } catch (error) {
      console.error('Error sending prompt:', error);
      toast({
        title: "Error",
        description: "Failed to send prompt to table.",
        variant: "destructive"
      });
    }
  };

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
            onClick={handleSendPrompt}
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
