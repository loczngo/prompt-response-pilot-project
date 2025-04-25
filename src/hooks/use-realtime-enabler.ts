
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeEnabler = () => {
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        // Enable realtime for all tables
        await supabase.rpc('enable_realtime', {});
        console.log('Realtime functionality enabled on tables');
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
      }
    };

    enableRealtime();
  }, []);
};
