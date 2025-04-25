
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BellRing } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { supabase } from '@/integrations/supabase/client';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

const GuestInterface = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { tables, prompts, announcements } = useRealtimeUpdates();
  
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  // Find user's table and any active prompts
  useEffect(() => {
    if (!user?.tableNumber) return;

    const userTable = tables.find(t => t.id === user.tableNumber);
    if (!userTable) return;

    const tablePrompts = prompts.filter(p => 
      p.status === 'active' && 
      (p.target_table === null || p.target_table === user.tableNumber)
    );

    if (tablePrompts.length > 0) {
      // Get the most recent prompt
      const latestPrompt = tablePrompts[tablePrompts.length - 1];
      setCurrentPrompt(latestPrompt);
    } else {
      setCurrentPrompt(null);
      setSelectedResponse(null);
      setHasResponded(false);
    }
  }, [user, tables, prompts]);

  // Handle announcements
  useEffect(() => {
    if (!user?.tableNumber) return;

    const tableAnnouncements = announcements.filter(a => 
      a.target_table === null || a.target_table === user.tableNumber
    );

    if (tableAnnouncements.length > 0) {
      const latestAnnouncement = tableAnnouncements[tableAnnouncements.length - 1];
      setLastAnnouncement(latestAnnouncement.text);
      setShowAnnouncement(true);

      // Hide announcement after 10 seconds
      const timer = setTimeout(() => {
        setShowAnnouncement(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user, announcements]);

  const handleResponse = async (response: ResponseOption) => {
    if (!user?.tableNumber || !user?.seatCode || !currentPrompt) return;

    try {
      // Store response directly in Supabase
      // We'll use a custom table structure that works with our schema
      const { error } = await supabase
        .from('announcements') // Using announcements as a workaround since responses table doesn't exist yet
        .insert({
          text: `Response ${response} to prompt ${currentPrompt.id}`,
          target_table: user.tableNumber
        });

      if (error) throw error;

      setSelectedResponse(response);
      if (response === 'YES' || response === 'NO') {
        setHasResponded(true);
      }

      toast({
        title: "Response Recorded",
        description: `Your response "${response}" has been submitted.`,
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="bg-background p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">PRS Guest Interface</h1>
            <p className="text-sm text-muted-foreground">
              Table {user?.tableNumber}, Seat {user?.seatCode}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6 flex flex-col items-center justify-center">
        {/* Announcement Banner */}
        {showAnnouncement && lastAnnouncement && (
          <div className="w-full max-w-xl mb-6 animate-fade-in">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <BellRing className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium">Announcement</h3>
                    <p className="text-sm mt-1">{lastAnnouncement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="w-full max-w-xl">
          {/* Guest Info Card */}
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
          
          {/* Prompt Display */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Current Prompt</CardTitle>
              <CardDescription>
                Please respond using the buttons below
              </CardDescription>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="p-6">
              <div className="teleprompter">
                {currentPrompt ? (
                  <p>{currentPrompt.text}</p>
                ) : (
                  <p className="text-muted-foreground italic">Waiting for prompt...</p>
                )}
              </div>
              
              {/* Response Buttons */}
              <div className="flex justify-center space-x-6 mt-8">
                <button
                  className={`response-button yes ${selectedResponse === 'YES' ? 'selected' : ''}`}
                  onClick={() => handleResponse('YES')}
                  disabled={!currentPrompt || hasResponded}
                >
                  YES
                </button>
                
                <button
                  className={`response-button no ${selectedResponse === 'NO' ? 'selected' : ''}`}
                  onClick={() => handleResponse('NO')}
                  disabled={!currentPrompt || hasResponded}
                >
                  NO
                </button>
                
                <button
                  className={`response-button service ${selectedResponse === 'SERVICE' ? 'selected' : ''}`}
                  onClick={() => handleResponse('SERVICE')}
                  disabled={!currentPrompt}
                >
                  SERVICE
                </button>
              </div>
              
              {selectedResponse && (
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  {selectedResponse === 'SERVICE' 
                    ? 'Service request sent!' 
                    : 'Thank you for your response!'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GuestInterface;
