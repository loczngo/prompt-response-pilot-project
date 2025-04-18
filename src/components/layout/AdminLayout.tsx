
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  LayoutList, 
  BellRing, 
  FileBarChart, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

type AdminLayoutProps = {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  allowedRoles: string[];
};

const AdminLayout = ({ children, currentSection, onSectionChange }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const navItems: NavItem[] = [
    { 
      name: 'dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      allowedRoles: ['super-admin', 'user-admin', 'table-admin'] 
    },
    { 
      name: 'prompts', 
      icon: <MessageSquare className="h-5 w-5" />, 
      allowedRoles: ['super-admin', 'table-admin'] 
    },
    { 
      name: 'users', 
      icon: <Users className="h-5 w-5" />, 
      allowedRoles: ['super-admin', 'user-admin'] 
    },
    { 
      name: 'tables', 
      icon: <LayoutList className="h-5 w-5" />, 
      allowedRoles: ['super-admin', 'table-admin'] 
    },
    { 
      name: 'announcements', 
      icon: <BellRing className="h-5 w-5" />, 
      allowedRoles: ['super-admin', 'table-admin'] 
    },
    { 
      name: 'reports', 
      icon: <FileBarChart className="h-5 w-5" />, 
      allowedRoles: ['super-admin'] 
    }
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-muted/30">
      {/* Mobile menu toggle */}
      <div className="fixed top-0 left-0 z-50 p-4 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="bg-background shadow-md border-primary/20"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background shadow-lg transform transition-transform duration-300 ease-in-out border-r",
          {
            "translate-x-0": sidebarOpen,
            "-translate-x-full": !sidebarOpen && isMobile,
          }
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-primary">PRS Admin</h1>
            <p className="text-sm text-muted-foreground">
              {user?.role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </p>
          </div>
          
          <Separator />
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems
              .filter(item => item.allowedRoles.includes(user?.role || ''))
              .map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    onSectionChange(item.name);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    currentSection === item.name
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {item.icon}
                  <span className="ml-3 capitalize">{item.name}</span>
                </button>
              ))
            }
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.username || 'Guest'}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out", 
          sidebarOpen ? "md:ml-64" : "ml-0"
        )}
      >
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
