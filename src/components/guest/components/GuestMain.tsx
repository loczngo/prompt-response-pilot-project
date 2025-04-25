
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionStatus } from './ConnectionStatus';
import { GuestAnnouncement } from './GuestAnnouncement';
import { PromptResponse } from './PromptResponse';
import type { User } from '@/lib/mockDb';

interface GuestMainProps {
  user: User;
  realtimeStatus: 'connecting' | 'connected' | 'error';
  onRefresh: () => void;
  showAnnouncement: boolean;
  lastAnnouncement: string | null;
  currentPrompt: any;
  selectedResponse: 'YES' | 'NO' | 'SERVICE' | null;
  hasResponded: boolean;
  onResponse: (response: 'YES' | 'NO' | 'SERVICE') => void;
}

export const GuestMain = ({
  user,
  realtimeStatus,
  onRefresh,
  showAnnouncement,
  lastAnnouncement,
  currentPrompt,
  selectedResponse,
  hasResponded,
  onResponse
}: GuestMainProps) => {
  return (
    <main className="flex-1 container mx-auto p-6 flex flex-col items-center justify-center">
      <ConnectionStatus status={realtimeStatus} onRefresh={onRefresh} />
      
      {showAnnouncement && lastAnnouncement && (
        <GuestAnnouncement text={lastAnnouncement} />
      )}
      
      <div className="w-full max-w-xl">
        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                {user?.firstName?.charAt(0)}
              </div>
              <div>
                <h2 className="font-medium text-lg">Welcome, {user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-muted-foreground">
                  You are seated at Table {user?.tableNumber}, Seat {user?.seatCode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <PromptResponse 
          currentPrompt={currentPrompt}
          selectedResponse={selectedResponse}
          hasResponded={hasResponded}
          onResponse={onResponse}
        />
      </div>
    </main>
  );
};
