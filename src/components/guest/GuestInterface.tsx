
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';
import { supabase } from '@/integrations/supabase/client';
import { GuestHeader } from './components/GuestHeader';
import { ConnectionStatus } from './components/ConnectionStatus';
import { GuestAnnouncement } from './components/GuestAnnouncement';
import { PromptResponse } from './components/PromptResponse';

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

  // This effect monitors tables for prompt changes
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

    // If the table has a current prompt, find it in our prompts array
    if (userTable.currentPromptId) {
      console.log(`Table ${user.tableNumber} has current prompt ID: ${userTable.currentPromptId}`);
      
      const tablePrompt = prompts.find(p => p.id === userTable.currentPromptId);
      
      if (tablePrompt) {
        console.log('Setting current prompt to:', tablePrompt);
        setCurrentPrompt(tablePrompt);
        setSelectedResponse(null);
        setHasResponded(false);
      } else {
        console.log(`Prompt ${userTable.currentPromptId} not found in prompts array`);
      }
    } else {
      // Reset current prompt if table has no assigned prompt
      setCurrentPrompt(null);
    }
  }, [user, tables, prompts]);

  // This effect specifically looks for active prompts that target the user's table
  useEffect(() => {
    if (!user?.tableNumber) return;
    
    console.log('Filtering prompts for table:', user.tableNumber);
    const tablePrompts = prompts.filter(p => 
      p.status === 'active' && 
      (p.target_table === null || p.target_table === user.tableNumber)
    );

    console.log('Active prompts for this table:', tablePrompts);
    
    if (tablePrompts.length > 0) {
      // Sort by creation date to get the latest prompt
      const latestPrompt = tablePrompts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Only update if this is a different prompt or no prompt is currently displayed
      if (!currentPrompt || latestPrompt.id !== currentPrompt.id) {
        console.log('Setting new latest prompt:', latestPrompt);
        setCurrentPrompt(latestPrompt);
        setSelectedResponse(null);
        setHasResponded(false);
      }
    }
  }, [user, prompts, currentPrompt]);

  useEffect(() => {
    if (!user?.tableNumber || !announcements.length) return;

    const tableAnnouncements = announcements.filter(a => 
      a.target_table === null || a.target_table === user.tableNumber
    );

    if (tableAnnouncements.length > 0) {
      const latestAnnouncement = tableAnnouncements[0];
      
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
      <GuestHeader onRefresh={refreshData} onLogout={logout} />
      
      <main className="flex-1 container mx-auto p-6 flex flex-col items-center justify-center">
        <ConnectionStatus status={realtimeStatus} onRefresh={refreshData} />
        
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
            onResponse={handleResponse}
          />
        </div>
      </main>
    </div>
  );
};

export default GuestInterface;
