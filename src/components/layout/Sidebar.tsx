
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  MessageSquare, 
  TableProperties, 
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menu = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: BarChart2 
    },
    { 
      name: 'Tables', 
      path: '/admin/tables', 
      icon: TableProperties 
    },
    { 
      name: 'Prompts', 
      path: '/admin/prompts', 
      icon: MessageSquare 
    },
    { 
      name: 'Announcements', 
      path: '/admin/announcements', 
      icon: Bell 
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: Users 
    }
  ];

  return (
    <div className="py-4">
      <nav className="space-y-1">
        {menu.map((item) => {
          const isActive = currentPath === item.path || 
                          (item.path !== '/admin' && currentPath.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
