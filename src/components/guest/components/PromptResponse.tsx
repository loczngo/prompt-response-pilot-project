
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PromptDisplay } from './prompt/PromptDisplay';
import { PromptResponseButtons } from './prompt/PromptResponseButtons';
import { PromptDebugInfo } from './prompt/PromptDebugInfo';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

interface PromptResponseProps {
  currentPrompt: any | null;
  selectedResponse: ResponseOption | null;
  hasResponded: boolean;
  onResponse: (response: ResponseOption) => void;
}

export const PromptResponse = ({ 
  currentPrompt, 
  selectedResponse, 
  hasResponded,
  onResponse 
}: PromptResponseProps) => {
  const [displayPrompt, setDisplayPrompt] = useState<any | null>(null);
  const lastPromptRef = useRef<any | null>(null);
  const promptUpdateCount = useRef(0);

  useEffect(() => {
    console.log("Current prompt in PromptResponse:", currentPrompt);
    
    if (currentPrompt && (!lastPromptRef.current || currentPrompt.id !== lastPromptRef.current.id)) {
      console.log("Setting new display prompt:", currentPrompt);
      setDisplayPrompt(currentPrompt);
      lastPromptRef.current = currentPrompt;
      promptUpdateCount.current += 1;
      console.log(`Prompt updated ${promptUpdateCount.current} times`);
    } else if (!currentPrompt && lastPromptRef.current) {
      console.log("Clearing display prompt");
      setDisplayPrompt(null);
      lastPromptRef.current = null;
    }
  }, [currentPrompt]);

  useEffect(() => {
    console.log("Display prompt state updated:", displayPrompt);
  }, [displayPrompt]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Current Prompt</CardTitle>
        <CardDescription>
          Please respond using the buttons below
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-6">
        <PromptDisplay displayPrompt={displayPrompt} />
        
        <PromptResponseButtons
          selectedResponse={selectedResponse}
          displayPrompt={displayPrompt}
          hasResponded={hasResponded}
          onResponse={onResponse}
        />
        
        {selectedResponse && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            {selectedResponse === 'SERVICE' 
              ? 'Service request sent!' 
              : 'Thank you for your response!'
            }
          </p>
        )}

        <PromptDebugInfo
          displayPrompt={displayPrompt}
          promptUpdateCount={promptUpdateCount.current}
        />
      </CardContent>
    </Card>
  );
};
