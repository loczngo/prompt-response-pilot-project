
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Prompt } from '@/lib/mockDb';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompts } from '@/hooks/use-prompts';
import { PromptCard } from './prompts/PromptCard';
import { PromptDialog } from './prompts/PromptDialog';

const Prompts = () => {
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const { user } = useAuth();
  const { prompts, handleAddPrompt, handleUpdatePrompt, handleDeletePrompt, canManagePrompts } = usePrompts(user?.role);
  
  if (user?.role !== 'super-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage prompts.
              Only Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const openEditDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowEditPrompt(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
        {user && canManagePrompts(user.role) && (
          <Button onClick={() => setShowAddPrompt(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        )}
      </div>
      
      <PromptDialog
        open={showAddPrompt}
        onOpenChange={setShowAddPrompt}
        title="Create New Prompt"
        description="Create a new prompt to be sent to tables."
        onSave={handleAddPrompt}
        isTableAdmin={user?.role === 'table-admin'}
      />
      
      <PromptDialog
        open={showEditPrompt}
        onOpenChange={setShowEditPrompt}
        title="Edit Prompt"
        description="Update the prompt details."
        prompt={selectedPrompt ?? undefined}
        onSave={(data) => selectedPrompt && handleUpdatePrompt(selectedPrompt.id, data)}
        isTableAdmin={user?.role === 'table-admin'}
      />
      
      <div className="space-y-4">
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No prompts found. Create your first prompt.</p>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={openEditDialog}
              onDelete={handleDeletePrompt}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Prompts;
