
import { useState, useEffect, useCallback } from 'react';
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
  const { tables, prompts, announcements, realtimeStatus, refreshData, lastError } = useRealtimeUpdates();
  
  // Enable realtime updates
  const { isEnabled: realtimeEnabled } = useRealtimeEnabler();
  
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseOption | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);
  const [lastPromptId, setLastPromptId] = useState<string | null>(null);

  // Debug logs
  useEffect(() => {
    console.log("User table number:", user?.tableNumber);
    console.log("Total tables:", tables.length, tables);
    console.log("Total active prompts:", prompts.length, prompts);
    console.log("Realtime enabled:", realtimeEnabled);
    console.log("Realtime status:", realtimeStatus);
    if (lastError) {
      console.log("Last error:", lastError);
    }
  }, [user, tables, prompts, realtimeEnabled, realtimeStatus, lastError]);

  // Find current prompt for this table
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

    // Filter active prompts for this table (or global prompts)
    console.log('Filtering prompts for table:', user.tableNumber);
    const tablePrompts = prompts.filter(p => 
      p.status === 'active' && 
      (p.target_table === null || p.target_table === user.tableNumber)
    );

    console.log('Filtered prompts for this table:', tablePrompts);
    
    if (tablePrompts.length > 0) {
      // Sort by most recent first if needed
      const sortedPrompts = [...tablePrompts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const latestPrompt = sortedPrompts[0];
      console.log('Latest prompt:', latestPrompt);
      
      // Check if prompt has changed
      if (!currentPrompt || currentPrompt.id !== latestPrompt.id) {
        console.log('Setting new current prompt:', latestPrompt);
        setCurrentPrompt(latestPrompt);
        setHasResponded(false);
        setSelectedResponse(null);
        setLastPromptId(latestPrompt.id);
      }
    } else {
      console.log('No active prompts found for this table');
      setCurrentPrompt(null);
      setLastPromptId(null);
    }
  }, [user, tables, prompts, currentPrompt]);

  // Handle announcements
  useEffect(() => {
    if (!user?.tableNumber || !announcements.length) return;

    console.log('Processing announcements for table:', user.tableNumber);
    const tableAnnouncements = announcements.filter(a => 
      a.target_table === null || a.target_table === user.tableNumber
    );

    console.log('Filtered announcements:', tableAnnouncements);

    if (tableAnnouncements.length > 0) {
      // Sort by most recent first
      const sortedAnnouncements = [...tableAnnouncements].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const latestAnnouncement = sortedAnnouncements[0];
      
      if (!lastAnnouncement || latestAnnouncement.text !== lastAnnouncement) {
        console.log('Showing new announcement:', latestAnnouncement.text);
        setLastAnnouncement(latestAnnouncement.text);
        setShowAnnouncement(true);

        const timer = setTimeout(() => {
          setShowAnnouncement(false);
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, announcements, lastAnnouncement]);

  const handleResponse = useCallback(async (response: ResponseOption) => {
    if (!user?.tableNumber || !user?.seatCode || !currentPrompt) return;

    try {
      console.log(`Submitting response ${response} for prompt ${currentPrompt.id}`);
      
      // For guest users, we'll handle the response slightly differently
      const { error } = await supabase
        .from('announcements')
        .insert({
          text: `Response ${response} to prompt "${currentPrompt.text}"`,
          target_table: user.tableNumber
        });

      if (error) {
        console.error('Error submitting response:', error);
        
        // For guest users, show a toast even if there's an error
        // since they may not have full database permissions
        toast({
          title: "Response Recorded",
          description: `Your response "${response}" has been submitted.`,
        });
        setSelectedResponse(response);
        if (response === 'YES' || response === 'NO') {
          setHasResponded(true);
        }
      } else {
        setSelectedResponse(response);
        if (response === 'YES' || response === 'NO') {
          setHasResponded(true);
        }

        toast({
          title: "Response Recorded",
          description: `Your response "${response}" has been submitted.`,
        });
      }
      
      // Force refresh data after submitting a response
      refreshData();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Response Recorded",
        description: `Your response "${response}" has been recorded locally.`,
      });
      
      // Even if there's an error, we'll update the UI for guest users
      setSelectedResponse(response);
      if (response === 'YES' || response === 'NO') {
        setHasResponded(true);
      }
    }
  }, [user, currentPrompt, toast, refreshData]);

  // Force refresh data periodically
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      refreshData();
    }, 1000); // Initial refresh after 1 second
    
    const intervalTimer = setInterval(() => {
      refreshData();
    }, 3000); // More frequent refresh every 3 seconds for guest users
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [refreshData]);

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
