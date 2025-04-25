
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPanelContent from './layout/AdminPanelContent';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { user } = useAuth();
  
  // Use the custom hook to handle realtime functionality
  useRealtimeEnabler();
  
  return (
    <AdminLayout 
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      <AdminPanelContent currentSection={currentSection} />
    </AdminLayout>
  );
};

export default AdminPanel;
