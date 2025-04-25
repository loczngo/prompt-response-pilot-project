
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../use-toast';

export const useDataFetching = () => {
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching initial data from Supabase...');
      
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*, seats(*)');
      
      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        toast({
          title: "Data Loading Error",
          description: "Could not load tables information",
          variant: "destructive"
        });
        return { tablesData: null, promptsData: null, announcementsData: null };
      }

      // Fetch prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (promptsError) {
        console.error('Error fetching prompts:', promptsError);
      }

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
      }

      return {
        tablesData: tablesData || [],
        promptsData: promptsData || [],
        announcementsData: announcementsData || []
      };
    } catch (error) {
      console.error('Error in fetchData:', error);
      return { tablesData: null, promptsData: null, announcementsData: null };
    }
  }, [toast]);

  return { fetchData };
};
