
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPanelContent from './layout/AdminPanelContent';
import { useRealtimeEnabler } from '@/hooks/use-realtime-enabler';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the custom hook to handle realtime functionality
  const { isEnabled } = useRealtimeEnabler();
  
  // Get the refresh function from realtime updates
  const { refreshData } = useRealtimeUpdates();
  
  const handleManualRefresh = () => {
    refreshData();
    toast({
      title: "Refreshing Data",
      description: "Manually refreshing all data from the database.",
    });
  };
  
  return (
    <AdminLayout 
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {!isEnabled && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-amber-500 mr-2" />
            <span className="font-medium text-amber-800">
              Realtime updates disconnected
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={handleManualRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Some features may not update automatically. You can manually refresh the data.
          </p>
        </div>
      )}
      <AdminPanelContent currentSection={currentSection} />
    </AdminLayout>
  );
};

export default AdminPanel;
