
import React from 'react';

interface PromptDisplayProps {
  displayPrompt: any | null;
}

export const PromptDisplay = ({ displayPrompt }: PromptDisplayProps) => {
  return (
    <div className="teleprompter p-4 bg-muted/30 rounded-lg min-h-[100px] flex items-center justify-center">
      {displayPrompt ? (
        <div className="text-lg text-center">
          <p className="font-medium">{displayPrompt.text}</p>
          <p className="text-xs text-muted-foreground mt-2">Prompt ID: {displayPrompt.id}</p>
        </div>
      ) : (
        <p className="text-muted-foreground italic">Waiting for prompt...</p>
      )}
    </div>
  );
};
