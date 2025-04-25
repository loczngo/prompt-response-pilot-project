
import Dashboard from '@/components/admin/Dashboard';
import Prompts from '@/components/admin/Prompts';
import Users from '@/components/admin/Users';
import Tables from '@/components/admin/Tables';
import Announcements from '@/components/admin/Announcements';
import Reports from '@/components/admin/Reports';

type AdminPanelContentProps = {
  currentSection: string;
};

const AdminPanelContent = ({ currentSection }: AdminPanelContentProps) => {
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

export default AdminPanelContent;
