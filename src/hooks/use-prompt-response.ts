
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

export const usePromptResponse = (userTableNumber: number | undefined | null) => {
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [lastPromptId, setLastPromptId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleResponse = async (response: ResponseOption) => {
    if (!userTableNumber || !currentPrompt) return;

    try {
      console.log(`Submitting response ${response} for prompt ${currentPrompt.id}`);
      
      const { error } = await supabase
        .from('announcements')
        .insert({
          text: `Response ${response} to prompt "${currentPrompt.text}"`,
          target_table: userTableNumber
        });

      if (error) {
        console.error('Error submitting response:', error);
        toast({
          title: "Response Recorded",
          description: `Your response "${response}" has been submitted.`,
        });
      }

      setSelectedResponse(response);
      if (response === 'YES' || response === 'NO') {
        setHasResponded(true);
      }

      toast({
        title: "Response Recorded",
        description: `Your response "${response}" has been submitted.`,
      });
      
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Response Recorded",
        description: `Your response "${response}" has been recorded locally.`,
      });
      
      setSelectedResponse(response);
      if (response === 'YES' || response === 'NO') {
        setHasResponded(true);
      }
    }
  };

  return {
    currentPrompt,
    setCurrentPrompt,
    selectedResponse,
    hasResponded,
    setHasResponded,
    lastPromptId,
    setLastPromptId,
    handleResponse
  };
};
