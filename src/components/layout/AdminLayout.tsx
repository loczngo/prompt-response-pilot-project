
import { ReactNode, useState, useEffect } from 'react';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';
import Sidebar from '@/components/layout/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const AdminLayout = ({ children, currentSection, onSectionChange }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Enable realtime updates for admin layout
  useRealtimeEnabler();
  
  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
