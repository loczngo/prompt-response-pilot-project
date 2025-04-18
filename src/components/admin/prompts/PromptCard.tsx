
import { Prompt } from '@/lib/mockDb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export const PromptCard = ({ prompt, onEdit, onDelete }: PromptCardProps) => {
  return (
    <Card className={prompt.status === 'inactive' ? 'opacity-60' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{prompt.text}</h3>
            <p className="text-sm text-muted-foreground">
              Target: {prompt.targetTable === null ? 'All Tables' : `Table ${prompt.targetTable}`}
            </p>
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex h-2 w-2 rounded-full mr-2 ${
                  prompt.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs">
                {prompt.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(prompt)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(prompt.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
