
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import AdminPanel from '@/components/admin/AdminPanel';
import GuestInterface from '@/components/guest/GuestInterface';

const Index = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/40 mb-4"></div>
          <div className="h-4 w-32 bg-primary/40 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show auth screen
  if (!user) {
    return <Auth />;
  }
  
  // Render appropriate interface based on user role
  if (user.role === 'guest') {
    return <GuestInterface />;
  } else {
    // Admin roles: super-admin, user-admin, table-admin
    return <AdminPanel />;
  }
};

export default Index;
