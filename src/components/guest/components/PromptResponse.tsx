
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

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

  // Update display prompt whenever currentPrompt changes
  useEffect(() => {
    console.log("Current prompt in PromptResponse:", currentPrompt);
    setDisplayPrompt(currentPrompt);
  }, [currentPrompt]);

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
        <div className="teleprompter p-4 bg-muted/30 rounded-lg min-h-[100px] flex items-center justify-center">
          {displayPrompt ? (
            <p className="text-lg text-center">{displayPrompt.text}</p>
          ) : (
            <p className="text-muted-foreground italic">Waiting for prompt...</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-6 mt-8">
          <button
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              selectedResponse === 'YES' 
                ? "bg-green-500 text-white shadow-md" 
                : "bg-muted hover:bg-green-100"
            )}
            onClick={() => onResponse('YES')}
            disabled={!displayPrompt || hasResponded}
          >
            YES
          </button>
          
          <button
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              selectedResponse === 'NO' 
                ? "bg-red-500 text-white shadow-md" 
                : "bg-muted hover:bg-red-100"
            )}
            onClick={() => onResponse('NO')}
            disabled={!displayPrompt || hasResponded}
          >
            NO
          </button>
          
          <button
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              selectedResponse === 'SERVICE' 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-muted hover:bg-blue-100"
            )}
            onClick={() => onResponse('SERVICE')}
            disabled={!displayPrompt}
          >
            SERVICE
          </button>
        </div>
        
        {selectedResponse && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            {selectedResponse === 'SERVICE' 
              ? 'Service request sent!' 
              : 'Thank you for your response!'
            }
          </p>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
            <p>Debug Info:</p>
            <p>Current Prompt: {displayPrompt ? `ID: ${displayPrompt.id}, Text: ${displayPrompt.text}` : 'None'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
