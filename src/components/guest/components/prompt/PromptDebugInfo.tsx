
import React from 'react';

interface PromptDebugInfoProps {
  displayPrompt: any | null;
  promptUpdateCount: number;
}

export const PromptDebugInfo = ({ displayPrompt, promptUpdateCount }: PromptDebugInfoProps) => {
  return (
    <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
      <p>Debug Info:</p>
      <p>Current Prompt: {displayPrompt ? `ID: ${displayPrompt.id}, Text: ${displayPrompt.text}` : 'None'}</p>
      <p>Updates: {promptUpdateCount}</p>
    </div>
  );
};
