
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        <div className="teleprompter">
          {currentPrompt ? (
            <p>{currentPrompt.text}</p>
          ) : (
            <p className="text-muted-foreground italic">Waiting for prompt...</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-6 mt-8">
          <button
            className={`response-button yes ${selectedResponse === 'YES' ? 'selected' : ''}`}
            onClick={() => onResponse('YES')}
            disabled={!currentPrompt || hasResponded}
          >
            YES
          </button>
          
          <button
            className={`response-button no ${selectedResponse === 'NO' ? 'selected' : ''}`}
            onClick={() => onResponse('NO')}
            disabled={!currentPrompt || hasResponded}
          >
            NO
          </button>
          
          <button
            className={`response-button service ${selectedResponse === 'SERVICE' ? 'selected' : ''}`}
            onClick={() => onResponse('SERVICE')}
            disabled={!currentPrompt}
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
            <p>Current Prompt: {currentPrompt ? `ID: ${currentPrompt.id}, Text: ${currentPrompt.text}` : 'None'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
