
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Prompt } from '@/lib/mockDb';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompts } from '@/hooks/use-prompts';
import { PromptCard } from './prompts/PromptCard';
import { PromptDialog } from './prompts/PromptDialog';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Prompts = () => {
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const { user } = useAuth();
  const { handleUpdatePrompt, handleDeletePrompt, canManagePrompts } = usePrompts(
    user?.role, 
    user?.tableNumber
  );
  const { prompts: realTimePrompts, realtimeStatus } = useRealtimeUpdates();
  const { toast } = useToast();
  
  // Use realTimePrompts instead of getPrompts()
  const prompts = realTimePrompts;
  
  // Fixed TypeScript error: Use strict equality comparison with specific role type
  if (user?.role !== 'super-admin' && user?.role !== 'table-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage prompts.
              Only Super Admins and Table Admins can access this section.
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

  // Fixed: Modified to return Promise<boolean> to match the expected type in PromptDialog
  const handleAddPrompt = async (promptData: {
    text: string;
    targetTable: string | null;
    isActive: boolean;
  }): Promise<boolean> => {
    try {
      console.log('Creating new prompt in Supabase:', promptData);
      const { error } = await supabase
        .from('prompts')
        .insert({
          text: promptData.text,
          target_table: promptData.targetTable ? Number(promptData.targetTable) : null,
          status: promptData.isActive ? 'active' : 'inactive'
        });

      if (error) {
        console.error('Supabase error creating prompt:', error);
        throw error;
      }

      toast({
        title: "Prompt Created",
        description: "The prompt has been successfully created.",
      });
      
      return true;
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to create prompt.",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {realtimeStatus !== 'connected' && (
        <div className={`p-2 text-sm rounded-md mb-4 ${
          realtimeStatus === 'connecting' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
        }`}>
          {realtimeStatus === 'connecting' 
            ? "Connecting to realtime updates..." 
            : "Error connecting to realtime updates. Some features may not work properly."}
        </div>
      )}
      
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
        tableNumber={user?.tableNumber}
      />
      
      <PromptDialog
        open={showEditPrompt}
        onOpenChange={setShowEditPrompt}
        title="Edit Prompt"
        description="Update the prompt details."
        prompt={selectedPrompt ?? undefined}
        onSave={(data) => selectedPrompt && handleUpdatePrompt(selectedPrompt.id, data)}
        isTableAdmin={user?.role === 'table-admin'}
        tableNumber={user?.tableNumber}
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
