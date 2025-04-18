
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getTable, 
  getPrompts, 
  getAnnouncementsForTable, 
  getResponses, 
  createResponse,
  Response
} from '@/lib/mockDb';
import { BellRing } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type ResponseOption = 'YES' | 'NO' | 'SERVICE';

const GuestInterface = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  
  // Make sure we have necessary user info
  if (!user || !user.tableNumber || !user.seatCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Session</h2>
            <p className="text-muted-foreground mb-4">
              Your session is invalid or has expired.
            </p>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Return to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  useEffect(() => {
    const checkForPrompt = () => {
      const table = getTable(user.tableNumber!);
      if (!table) return;
      
      const prompt = table.currentPromptId 
        ? getPrompts().find(p => p.id === table.currentPromptId) 
        : null;
      
      if (prompt && prompt.status === 'active') {
        setCurrentPrompt(prompt.text);
        setCurrentPromptId(prompt.id);
        
        // Check if user has already responded to this prompt
        const existingResponse = getResponses().find(r => 
          r.promptId === prompt.id && 
          r.userId === user.id &&
          r.tableNumber === user.tableNumber &&
          r.seatCode === user.seatCode
        );
        
        if (existingResponse) {
          setSelectedResponse(existingResponse.answer as ResponseOption);
          setHasResponded(true);
        } else {
          setSelectedResponse(null);
          setHasResponded(false);
        }
      } else {
        setCurrentPrompt(null);
        setCurrentPromptId(null);
        setSelectedResponse(null);
        setHasResponded(false);
      }
      
      // Check for announcements
      const announcements = getAnnouncementsForTable(user.tableNumber!);
      if (announcements.length > 0) {
        const latest = announcements.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        setLastAnnouncement(latest.text);
        setShowAnnouncement(true);
        
        // Hide announcement after 10 seconds
        setTimeout(() => {
          setShowAnnouncement(false);
        }, 10000);
      }
    };
    
    // Check immediately and then every 3 seconds
    checkForPrompt();
    const interval = setInterval(checkForPrompt, 3000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const handleResponse = (response: ResponseOption) => {
    if (!currentPromptId || !user.tableNumber || !user.seatCode) return;
    
    // Create the response
    const newResponse: Omit<Response, 'id' | 'timestamp'> = {
      userId: user.id,
      promptId: currentPromptId,
      tableNumber: user.tableNumber,
      seatCode: user.seatCode,
      answer: response
    };
    
    createResponse(newResponse);
    setSelectedResponse(response);
    setHasResponded(true);
    
    // Show confirmation
    toast({
      title: "Response Recorded",
      description: `Your response "${response}" has been submitted.`,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="bg-background p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">PRS Guest Interface</h1>
            <p className="text-sm text-muted-foreground">
              Table {user.tableNumber}, Seat {user.seatCode}
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
                  {user.firstName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-medium text-lg">Welcome, {user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-muted-foreground">
                    You are seated at Table {user.tableNumber}, Seat {user.seatCode}
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
                  <p>{currentPrompt}</p>
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
                  disabled={hasResponded && selectedResponse !== 'SERVICE'}
                >
                  SERVICE
                </button>
              </div>
              
              {hasResponded && (
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
