
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

import Dashboard from './Dashboard';
import Prompts from './Prompts';
import Users from './Users';
import Tables from './Tables';
import Announcements from './Announcements';
import Reports from './Reports';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { user } = useAuth();
  
  // Enable realtime functionality on first load
  useEffect(() => {
    const enableRealtime = async () => {
      try {
        // Call RPC function without any arguments
        await supabase.rpc('enable_realtime_tables');
        console.log('Realtime functionality enabled on tables');
      } catch (error) {
        console.error('Error enabling realtime functionality:', error);
      }
    };

    enableRealtime();
  }, []);

  // Render content based on current section
  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'prompts':
        return <Prompts />;
      case 'users':
        return <Users />;
      case 'tables':
        return <Tables />;
      case 'announcements':
        return <Announcements />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <AdminLayout 
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPanel;
