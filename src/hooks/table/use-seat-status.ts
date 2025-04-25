
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSeatStatus = (refreshTables: () => void) => {
  const { toast } = useToast();

  const handleSeatStatusToggle = useCallback(async (tableId: number, seatCode: string) => {
    try {
      // First, get the current seat status
      const { data: seat, error: fetchError } = await supabase
        .from('seats')
        .select('status')
        .eq('table_id', tableId)
        .eq('code', seatCode)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newStatus = seat.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('seats')
        .update({ status: newStatus })
        .eq('table_id', tableId)
        .eq('code', seatCode);
      
      if (error) throw error;
      
      refreshTables();
      
      toast({
        title: `Seat ${seatCode} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Seat ${seatCode} is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error toggling seat status:', error);
      toast({
        title: "Error Updating Seat",
        description: "Failed to update seat status. Please try again.",
        variant: "destructive",
      });
    }
  }, [refreshTables, toast]);

  return { handleSeatStatusToggle };
};
