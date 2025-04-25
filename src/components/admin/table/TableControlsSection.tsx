
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
  const [prompts, setPrompts] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        // Fetch prompts from Supabase
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching prompts:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Convert Supabase prompts to local format
          setPrompts(data);
        } else {
          // Fallback to local storage data
          setPrompts(getPrompts());
        }
      } catch (error) {
        console.error('Error in fetchPrompts:', error);
        // Fallback to local storage data
        setPrompts(getPrompts());
      }
    };
    
    fetchPrompts();
  }, []);

  const handleSendPrompt = async () => {
    if (!selectedTable || !selectedPromptId) return;
    
    try {
      // Update the table in Supabase with the selected prompt ID
      const { error } = await supabase
        .from('tables')
        .update({
          current_prompt_id: selectedPromptId
        })
        .eq('id', selectedTable.id);
        
      if (error) {
        console.error('Error sending prompt to table:', error);
        toast({
          title: "Error",
          description: "Failed to send the prompt to the table.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Prompt Sent",
        description: "The prompt has been sent to the table.",
      });
      
      // Call the original onSendPrompt to update local state
      onSendPrompt();
    } catch (error) {
      console.error('Error in handleSendPrompt:', error);
      toast({
        title: "Error",
        description: "Failed to send the prompt to the table.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Send Prompt</CardTitle>
        <CardDescription>
          Send a prompt to display on guest devices
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Select Prompt</Label>
            <Select value={selectedPromptId} onValueChange={onPromptSelect}>
              <SelectTrigger id="prompt">
                <SelectValue placeholder="Choose a prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.length === 0 ? (
                  <SelectItem value="no-prompts" disabled>No prompts available</SelectItem>
                ) : (
                  prompts.map((prompt) => (
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
            onClick={handleSendPrompt}
            disabled={!selectedPromptId}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send to Table
          </Button>
          
          <div className="text-sm text-muted-foreground mt-4">
            {selectedTable.currentPromptId ? (
              <div>
                <p>Current prompt:</p>
                <p className="font-medium">
                  {prompts.find(p => p.id === selectedTable.currentPromptId)?.text || 'Unknown prompt'}
                </p>
              </div>
            ) : (
              <p>No prompt is currently active for this table.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
