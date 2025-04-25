
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  // Add animation state for new prompts
  const [isNewPrompt, setIsNewPrompt] = useState(false);
  
  // Effect to trigger animation when a new prompt is received
  useEffect(() => {
    if (currentPrompt) {
      setIsNewPrompt(true);
      const timer = setTimeout(() => {
        setIsNewPrompt(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPrompt?.id]); // Only trigger when prompt ID changes

  return (
    <Card className={`shadow-md transition-all duration-300 ${isNewPrompt ? 'border-primary shadow-primary/20' : ''}`}>
      <CardHeader>
        <CardTitle>Current Prompt</CardTitle>
        <CardDescription>
          Please respond using the buttons below
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-6">
        <div className={`teleprompter p-4 rounded-md ${isNewPrompt ? 'bg-primary/5 animate-pulse' : 'bg-background'}`}>
          {currentPrompt ? (
            <p className="text-lg font-medium">{currentPrompt.text}</p>
          ) : (
            <p className="text-muted-foreground italic">Waiting for prompt...</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-6 mt-8">
          <Button
            variant={selectedResponse === 'YES' ? "default" : "outline"}
            className={`px-6 py-4 h-auto ${selectedResponse === 'YES' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={() => onResponse('YES')}
            disabled={!currentPrompt || hasResponded}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            YES
          </Button>
          
          <Button
            variant={selectedResponse === 'NO' ? "default" : "outline"}
            className={`px-6 py-4 h-auto ${selectedResponse === 'NO' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={() => onResponse('NO')}
            disabled={!currentPrompt || hasResponded}
          >
            <XCircle className="mr-2 h-5 w-5" />
            NO
          </Button>
          
          <Button
            variant={selectedResponse === 'SERVICE' ? "default" : "outline"}
            className="px-6 py-4 h-auto"
            onClick={() => onResponse('SERVICE')}
            disabled={!currentPrompt}
          >
            <Bell className="mr-2 h-5 w-5" />
            SERVICE
          </Button>
        </div>
        
        {selectedResponse && (
          <div className="text-center mt-6 p-3 bg-muted rounded-md">
            <p className="font-medium">
              {selectedResponse === 'SERVICE' 
                ? 'Service request sent!' 
                : 'Thank you for your response!'
              }
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
            <p>Debug Info:</p>
            <p>Current Prompt: {currentPrompt ? `ID: ${currentPrompt.id}, Text: ${currentPrompt.text}` : 'None'}</p>
            <p>Prompt Status: {currentPrompt?.status}</p>
            <p>Target Table: {currentPrompt?.target_table === null ? 'All Tables' : currentPrompt?.target_table}</p>
            <p>Last Updated: {currentPrompt?.created_at ? new Date(currentPrompt.created_at).toLocaleTimeString() : 'N/A'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
