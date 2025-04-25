
import { useAuth } from '@/contexts/AuthContext';
import { TableSelection } from './TableSelection';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';
import { GuestHeader } from './components/GuestHeader';
import { GuestMain } from './components/GuestMain';
import { usePromptResponse } from '@/hooks/use-prompt-response';
import { useAnnouncementDisplay } from '@/hooks/use-announcement-display';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

const GuestInterface = () => {
  const { user, logout } = useAuth();
  const { tables, prompts, announcements, realtimeStatus, refreshData } = useRealtimeUpdates();
  const { isEnabled: realtimeEnabled } = useRealtimeEnabler();
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const {
    currentPrompt,
    setCurrentPrompt,
    selectedResponse,
    hasResponded,
    setHasResponded,
    lastPromptId,
    setLastPromptId,
    handleResponse
  } = usePromptResponse(user?.tableNumber);
  
  const {
    showAnnouncement,
    lastAnnouncement,
    setLastAnnouncement,
    setShowAnnouncement,
    displayAnnouncement
  } = useAnnouncementDisplay();

  // Debug logs
  useEffect(() => {
    console.log("User table number:", user?.tableNumber);
    console.log("Total tables:", tables.length, tables);
    console.log("Total active prompts:", prompts.length, prompts);
    console.log("Realtime enabled:", realtimeEnabled);
    console.log("Realtime status:", realtimeStatus);
  }, [user, tables, prompts, realtimeEnabled, realtimeStatus]);

  // Initial data load notification
  useEffect(() => {
    if (tables.length > 0 && !isInitialLoadDone) {
      setIsInitialLoadDone(true);
      toast({
        title: "Connected to server",
        description: "Live updates are now active",
      });
    }
  }, [tables, isInitialLoadDone]);

  // Handle prompts
  useEffect(() => {
    if (!user?.tableNumber) return;

    const userTable = tables.find(t => t.id === user.tableNumber);
    if (!userTable) return;

    const tablePrompts = prompts.filter(p => 
      p.status === 'active' && 
      (p.target_table === null || p.target_table === user.tableNumber)
    );
    
    if (tablePrompts.length > 0) {
      const sortedPrompts = [...tablePrompts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const latestPrompt = sortedPrompts[0];
      
      if (!currentPrompt || currentPrompt.id !== latestPrompt.id) {
        setCurrentPrompt(latestPrompt);
        setHasResponded(false);
        setLastPromptId(latestPrompt.id);
      }
    } else {
      setCurrentPrompt(null);
      setLastPromptId(null);
    }
  }, [user, tables, prompts]);

  // Handle announcements
  useEffect(() => {
    if (!user?.tableNumber || !announcements.length) return;

    const tableAnnouncements = announcements.filter(a => 
      a.target_table === null || a.target_table === user.tableNumber
    );

    if (tableAnnouncements.length > 0) {
      const sortedAnnouncements = [...tableAnnouncements].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const latestAnnouncement = sortedAnnouncements[0];
      
      if (!lastAnnouncement || latestAnnouncement.text !== lastAnnouncement) {
        displayAnnouncement(latestAnnouncement.text);
      }
    }
  }, [user, announcements]);

  // Force refresh data periodically and on mount
  useEffect(() => {
    // Initial refresh after a short delay
    const initialTimer = setTimeout(() => {
      refreshData();
    }, 500);
    
    // Regular refresh interval - more frequent for improved responsiveness
    const intervalTimer = setInterval(() => {
      refreshData();
    }, 2000); // Reduced to 2 seconds for better responsiveness
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [refreshData]);

  if (!user?.tableNumber) {
    return <TableSelection />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <GuestHeader onRefresh={refreshData} onLogout={logout} />
      <GuestMain
        user={user}
        realtimeStatus={realtimeStatus}
        onRefresh={refreshData}
        showAnnouncement={showAnnouncement}
        lastAnnouncement={lastAnnouncement}
        currentPrompt={currentPrompt}
        selectedResponse={selectedResponse}
        hasResponded={hasResponded}
        onResponse={handleResponse}
      />
    </div>
  );
};

export default GuestInterface;
