
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTableStatus = (refreshTables: () => void) => {
  const { toast } = useToast();

  const handleTableStatusToggle = useCallback(async (tableId: number) => {
    try {
      // First, get the current table status
      const { data: table, error: fetchError } = await supabase
        .from('tables')
        .select('status')
        .eq('id', tableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newStatus = table.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', tableId);
      
      if (error) throw error;
      
      refreshTables();
      
      toast({
        title: `Table ${tableId} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Table ${tableId} is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error toggling table status:', error);
      toast({
        title: "Error Updating Table",
        description: "Failed to update table status. Please try again.",
        variant: "destructive",
      });
    }
  }, [refreshTables, toast]);

  return { handleTableStatusToggle };
};
