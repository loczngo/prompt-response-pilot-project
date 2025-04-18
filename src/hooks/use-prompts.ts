
import { useState } from 'react';
import { Prompt, getPrompts, createPrompt, updatePrompt, deletePrompt, Role, User, getTable } from '@/lib/mockDb';
import { useToast } from '@/hooks/use-toast';

export const usePrompts = (userRole?: Role, userTableNumber?: number) => {
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
    if (!promptData.text) return false;
    
    // For table admins, ensure prompts are assigned to their table
    let targetTable = promptData.targetTable ? Number(promptData.targetTable) : null;
    if (userRole === 'table-admin' && userTableNumber) {
      targetTable = userTableNumber;
    }
    
    createPrompt({
      text: promptData.text,
      targetTable: targetTable,
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
    if (!promptData.text) return false;
    
    // For table admins, ensure prompts stay assigned to their table
    let targetTable = promptData.targetTable ? Number(promptData.targetTable) : null;
    if (userRole === 'table-admin' && userTableNumber) {
      targetTable = userTableNumber;
    }
    
    updatePrompt(id, {
      text: promptData.text,
      targetTable: targetTable,
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
    // For table admins, only show prompts for their table or global prompts
    if (userRole === 'table-admin' && userTableNumber) {
      return prompt.targetTable === null || prompt.targetTable === userTableNumber;
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
