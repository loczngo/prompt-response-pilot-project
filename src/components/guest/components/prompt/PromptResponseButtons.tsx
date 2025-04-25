
import React from 'react';
import { cn } from '@/lib/utils';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

interface PromptResponseButtonsProps {
  selectedResponse: ResponseOption | null;
  displayPrompt: any | null;
  hasResponded: boolean;
  onResponse: (response: ResponseOption) => void;
}

export const PromptResponseButtons = ({
  selectedResponse,
  displayPrompt,
  hasResponded,
  onResponse
}: PromptResponseButtonsProps) => {
  return (
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
  );
};
