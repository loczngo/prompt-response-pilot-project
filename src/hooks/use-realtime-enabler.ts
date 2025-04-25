
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeEnabler = () => {
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        // Using type assertion to fix the TypeScript error
        await supabase.rpc('enable_realtime_tables' as never);
        console.log('Realtime functionality enabled on tables');
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
      }
    };

    enableRealtime();
  }, []);
};
