
import { 
  Dashboard, 
  Prompts, 
  Users, 
  Tables, 
  Announcements, 
  Reports 
} from '@/components/admin';

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
