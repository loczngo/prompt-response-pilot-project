
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/mockDb';

export const testDatabaseConnection = async (user: User | null) => {
  if (!user || user.role === 'guest') {
    console.log('Skipping connection test for guest user');
    return true;
  }

  try {
    const { error: testError } = await supabase
      .from('announcements')
      .select('count(*)')
      .limit(1)
      .single();
      
    if (testError && testError.code !== '42501') {
      console.error('Supabase connection test failed:', testError);
      if (testError.code !== 'PGRST301' && !testError.message.includes('JWT')) {
        throw testError;
      }
    }
    return true;
  } catch (error) {
    console.error('Error in connection test:', error);
    return false;
  }
};
