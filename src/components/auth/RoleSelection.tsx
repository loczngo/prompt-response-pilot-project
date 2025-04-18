
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Role } from '@/lib/mockDb';
import { Users, UserCog, LayoutDashboard, User } from 'lucide-react';

type RoleSelectionProps = {
  onRoleSelect: (role: Role) => void;
};

const roles = [
  { 
    id: 'super-admin', 
    title: 'Super Admin', 
    description: 'Full access to all system features',
    icon: <Users className="h-8 w-8 mb-2 text-primary" />,
    requiresAuth: true
  },
  { 
    id: 'user-admin', 
    title: 'User Admin', 
    description: 'Manage users and permissions',
    icon: <UserCog className="h-8 w-8 mb-2 text-primary" />,
    requiresAuth: true
  },
  { 
    id: 'table-admin', 
    title: 'Table Admin', 
    description: 'Manage tables and player interactions',
    icon: <LayoutDashboard className="h-8 w-8 mb-2 text-primary" />,
    requiresAuth: true
  },
  { 
    id: 'guest', 
    title: 'Guest/Player', 
    description: 'Join a table and respond to prompts',
    icon: <User className="h-8 w-8 mb-2 text-primary" />,
    requiresAuth: false
  }
];

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Prompt and Response System</CardTitle>
          <CardDescription className="text-lg">Select your role to continue</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card 
                key={role.id}
                className={`cursor-pointer transform transition-all duration-300 hover:shadow-md hover:translate-y-[-5px] ${
                  hoveredRole === role.id ? 'bg-accent/80 border-primary' : ''
                }`}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => onRoleSelect(role.id as Role)}
              >
                <CardContent className="flex flex-col items-center p-6">
                  {role.icon}
                  <h3 className="text-xl font-semibold mt-2">{role.title}</h3>
                  <p className="text-sm text-center text-muted-foreground mt-2">{role.description}</p>
                  {role.requiresAuth && (
                    <Badge variant="outline" className="mt-3">
                      Requires Authentication
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground text-center">
            This is a proof-of-concept demonstration of the Prompt and Response System.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoleSelection;
