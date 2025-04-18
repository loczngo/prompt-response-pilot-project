
import { useState } from 'react';
import { Prompt, getPrompts, createPrompt, updatePrompt, deletePrompt, Role } from '@/lib/mockDb';
import { useToast } from '@/hooks/use-toast';

export const usePrompts = (userRole?: Role) => {
  const [prompts, setPrompts] = useState<Prompt[]>(getPrompts());
  const { toast } = useToast();

  const refreshPrompts = () => {
    setPrompts(getPrompts());
  };

  const handleAddPrompt = (promptData: {
    text: string;
    targetTable: string | null;
    isActive: boolean;
  }) => {
    if (!promptData.text) return;
    
    createPrompt({
      text: promptData.text,
      targetTable: promptData.targetTable ? Number(promptData.targetTable) : null,
      status: promptData.isActive ? 'active' : 'inactive'
    });
    
    refreshPrompts();
    
    toast({
      title: "Prompt Created",
      description: "The prompt has been successfully created.",
    });

    return true;
  };

  const handleUpdatePrompt = (
    id: string,
    promptData: {
      text: string;
      targetTable: string | null;
      isActive: boolean;
    }
  ) => {
    if (!promptData.text) return;
    
    updatePrompt(id, {
      text: promptData.text,
      targetTable: promptData.targetTable ? Number(promptData.targetTable) : null,
      status: promptData.isActive ? 'active' : 'inactive'
    });
    
    refreshPrompts();
    
    toast({
      title: "Prompt Updated",
      description: "The prompt has been successfully updated.",
    });

    return true;
  };

  const handleDeletePrompt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
      refreshPrompts();
      
      toast({
        title: "Prompt Deleted",
        description: "The prompt has been successfully deleted.",
      });
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    if (userRole === 'table-admin') {
      return prompt.targetTable === null;
    }
    return true;
  });

  const canManagePrompts = (role?: Role): boolean => {
    return role === 'super-admin' || role === 'table-admin';
  };

  return {
    prompts: filteredPrompts,
    handleAddPrompt,
    handleUpdatePrompt,
    handleDeletePrompt,
    canManagePrompts
  };
};
