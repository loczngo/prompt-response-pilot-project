
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleSelection from '@/components/auth/RoleSelection';
import AdminLogin from '@/components/auth/AdminLogin';
import GuestLogin from '@/components/auth/GuestLogin';
import { Role } from '@/lib/mockDb';

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { isLoading } = useAuth();
  
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
  
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };
  
  const handleBack = () => {
    setSelectedRole(null);
  };
  
  // Render appropriate login screen based on selected role
  if (selectedRole === 'guest') {
    return <GuestLogin onBack={handleBack} />;
  } else if (selectedRole) {
    return <AdminLogin role={selectedRole} onBack={handleBack} />;
  }
  
  // Initial role selection screen
  return <RoleSelection onRoleSelect={handleRoleSelect} />;
};

export default Auth;
