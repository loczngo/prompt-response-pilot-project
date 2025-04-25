import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Bell } from 'lucide-react';
import { PromptResponse } from './components/PromptResponse';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

const GuestInterface = () => {
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const lastPromptId = useRef<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleResponse = useCallback(async (response: ResponseOption) => {
    if (!currentPrompt) return;
    
    setSelectedResponse(response);
    setHasResponded(true);
    
    try {
      // Optimistically update the UI
      toast({
        title: "Response Sent",
        description: "Your response has been recorded.",
      });
      
      // Send the response to Supabase
      const { error } = await supabase
        .from('responses')
        .insert({
          prompt_id: currentPrompt.id,
          user_id: user?.id,
          response: response,
          table_number: user?.tableNumber,
          created_at: new Date().toISOString(),
        });
        
      if (error) {
        console.error("Error submitting response:", error);
        toast({
          title: "Error",
          description: "Failed to submit your response.",
          variant: "destructive",
        });
        
        // Revert the UI on failure
        setHasResponded(false);
        setSelectedResponse(null);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit your response.",
        variant: "destructive",
      });
      
      // Revert the UI on failure
      setHasResponded(false);
      setSelectedResponse(null);
    }
  }, [currentPrompt, user, setSelectedResponse, setHasResponded, toast, supabase]);
  
  useEffect(() => {
    const fetchCurrentPrompt = async () => {
      try {
        // First get the user's assigned table
        if (!user?.tableNumber) {
          console.log('No table assigned to user');
          return;
        }
        
        // Get the table from Supabase to get current_prompt_id
        const { data: tableData, error: tableError } = await supabase
          .from('tables')
          .select('*')
          .eq('id', user.tableNumber)
          .single();
          
        if (tableError) {
          console.error('Error fetching table:', tableError);
          return;
        }
        
        if (!tableData?.current_prompt_id) {
          console.log('No current prompt for table');
          setCurrentPrompt(null);
          return;
        }
        
        // Now fetch the prompt using the prompt ID from the table
        const { data: promptData, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', tableData.current_prompt_id)
          .single();
          
        if (promptError) {
          console.error('Error fetching prompt:', promptError);
          return;
        }
        
        if (promptData) {
          console.log('Found prompt:', promptData);
          setCurrentPrompt(promptData);
          
          // Reset response state when a new prompt arrives
          if (promptData.id !== lastPromptId.current) {
            setSelectedResponse(null);
            setHasResponded(false);
            lastPromptId.current = promptData.id;
          }
        }
      } catch (error) {
        console.error('Error in fetchCurrentPrompt:', error);
      }
    };
    
    // Fetch the prompt immediately on component mount
    fetchCurrentPrompt();
    
    // Set up interval to fetch prompt every 3 seconds
    const intervalId = setInterval(fetchCurrentPrompt, 3000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [user, setSelectedResponse, supabase]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <PromptResponse 
        currentPrompt={currentPrompt}
        selectedResponse={selectedResponse}
        hasResponded={hasResponded}
        onResponse={handleResponse}
      />
    </div>
  );
};

export default GuestInterface;
