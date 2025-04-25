
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface GuestHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

export const GuestHeader = ({ onRefresh, onLogout }: GuestHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-background p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">PRS Guest Interface</h1>
          <p className="text-sm text-muted-foreground">
            Table {user?.tableNumber}, Seat {user?.seatCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh data</span>
          </Button>
          <Button
            onClick={onLogout}
            className="px-3 py-1 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors"
          >
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
};
