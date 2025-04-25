
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PromptResponse } from './components/PromptResponse';
import { useToast } from '@/hooks/use-toast';
import { getPrompt, getTable, addResponse } from '@/lib/mockDb';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

const GuestInterface = () => {
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const lastPromptId = useRef<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleResponse = useCallback((response: ResponseOption) => {
    if (!currentPrompt || !user?.tableNumber || !user?.seatCode) return;
    
    setSelectedResponse(response);
    setHasResponded(true);
    
    try {
      // Add the response to mock database
      addResponse(
        currentPrompt.id,
        user.tableNumber,
        user.seatCode,
        response
      );
      
      toast({
        title: "Response Sent",
        description: "Your response has been recorded.",
      });
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
  }, [currentPrompt, user, toast]);
  
  useEffect(() => {
    const fetchCurrentPrompt = () => {
      try {
        // First get the user's assigned table
        if (!user?.tableNumber) {
          console.log('No table assigned to user');
          return;
        }
        
        // Get the table from mock database
        const tableData = getTable(user.tableNumber);
          
        if (!tableData) {
          console.log('Table not found');
          return;
        }
        
        if (!tableData.currentPromptId) {
          console.log('No current prompt for table');
          setCurrentPrompt(null);
          return;
        }
        
        // Now fetch the prompt using the prompt ID from the table
        const promptData = getPrompt(tableData.currentPromptId);
          
        if (!promptData) {
          console.log('Prompt not found');
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
  }, [user]);
  
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
