import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BellRing, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';
import { supabase } from '@/integrations/supabase/client';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

const GuestInterface = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { tables, prompts, announcements, realtimeStatus, refreshData } = useRealtimeUpdates();
  
  useRealtimeEnabler();
  
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    console.log('GuestInterface - User:', user);
    console.log('GuestInterface - Prompts data:', prompts);
    console.log('GuestInterface - Tables data:', tables);
  }, [user, prompts, tables]);

  const handleManualRefresh = async () => {
    toast({
      title: "Refreshing...",
      description: "Fetching the latest data from the server.",
    });
    await refreshData();
  };

  useEffect(() => {
    if (!user?.tableNumber) {
      console.log('No table number assigned to user');
      return;
    }

    console.log(`Looking for table ${user.tableNumber} in tables:`, tables);
    const userTable = tables.find(t => t.id === user.tableNumber);
    if (!userTable) {
      console.log(`Table ${user.tableNumber} not found`);
      return;
    }

    console.log('Filtering prompts for table:', user.tableNumber);
    const tablePrompts = prompts.filter(p => 
      p.status === 'active' && 
      (p.target_table === null || p.target_table === user.tableNumber)
    );

    console.log('Active prompts for this table:', tablePrompts);
    if (tablePrompts.length > 0) {
      const latestPrompt = tablePrompts[0];
      console.log('Setting current prompt to:', latestPrompt);
      
      if (!currentPrompt || currentPrompt.id !== latestPrompt.id) {
        setCurrentPrompt(latestPrompt);
        setSelectedResponse(null);
        setHasResponded(false);
      }
    } else {
      setCurrentPrompt(null);
      setSelectedResponse(null);
      setHasResponded(false);
    }
  }, [user, tables, prompts]);

  useEffect(() => {
    if (!user?.tableNumber || !announcements.length) return;

    const tableAnnouncements = announcements.filter(a => 
      a.target_table === null || a.target_table === user.tableNumber
    );

    if (tableAnnouncements.length > 0) {
      const latestAnnouncement = tableAnnouncements[0];
      console.log('Setting last announcement to:', latestAnnouncement.text);
      
      if (!lastAnnouncement || latestAnnouncement.text !== lastAnnouncement) {
        setLastAnnouncement(latestAnnouncement.text);
        setShowAnnouncement(true);

        const timer = setTimeout(() => {
          setShowAnnouncement(false);
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, announcements, lastAnnouncement]);

  const handleResponse = async (response: ResponseOption) => {
    if (!user?.tableNumber || !user?.seatCode || !currentPrompt) return;

    try {
      console.log(`Submitting response ${response} for prompt ${currentPrompt.id}`);
      
      const { error } = await supabase
        .from('announcements')
        .insert({
          text: `Response ${response} to prompt ${currentPrompt.id}`,
          target_table: user.tableNumber
        });

      if (error) {
        console.error('Error submitting response:', error);
        throw error;
      }

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
              onClick={handleManualRefresh}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh data</span>
            </Button>
            <Button
              onClick={logout}
              className="px-3 py-1 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6 flex flex-col items-center justify-center">
        {realtimeStatus !== 'connected' && (
          <div className="w-full max-w-xl mb-6">
            <Card className={`border-l-4 ${
              realtimeStatus === 'connecting' ? 'border-l-amber-500' : 'border-l-red-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      realtimeStatus === 'connecting' ? 'bg-amber-600 animate-pulse' : 'bg-red-600'
                    }`}></div>
                    <div>
                      <h3 className="font-medium">{
                        realtimeStatus === 'connecting' 
                          ? 'Connecting to realtime updates...' 
                          : 'Error connecting to realtime updates'
                      }</h3>
                      <p className="text-sm text-muted-foreground">{
                        realtimeStatus === 'connecting'
                          ? 'Please wait while we establish a connection.'
                          : 'Some features may not work properly.'
                      }</p>
                    </div>
                  </div>
                  {realtimeStatus === 'error' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleManualRefresh}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
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

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                  <p>Debug Info:</p>
                  <p>Prompt Count: {prompts.length}</p>
                  <p>Current Prompt: {currentPrompt ? `ID: ${currentPrompt.id}, Text: ${currentPrompt.text}` : 'None'}</p>
                  <p>Realtime Status: {realtimeStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GuestInterface;
