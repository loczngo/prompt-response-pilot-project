
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';

import Dashboard from './Dashboard';
import Prompts from './Prompts';
import Users from './Users';
import Tables from './Tables';
import Announcements from './Announcements';
import Reports from './Reports';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { user } = useAuth();
  
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
