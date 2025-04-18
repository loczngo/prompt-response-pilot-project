
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Announcement, Table, createAnnouncement, getAnnouncements, getTables } from '@/lib/mockDb';
import { BellRing, Plus, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  
  // Form state
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectAllTables, setSelectAllTables] = useState(true);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const tables = getTables();
  
  // Access control - only table-admin and super-admin can access
  if (currentUser?.role !== 'super-admin' && currentUser?.role !== 'table-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage announcements.
              Only Table Admins and Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const refreshAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };
  
  const handleSelectAllTablesChange = (checked: boolean) => {
    setSelectAllTables(checked);
    if (checked) {
      setSelectedTables([]);
    }
  };
  
  const handleTableSelectionChange = (tableId: number, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, tableId]);
    } else {
      setSelectedTables(selectedTables.filter(id => id !== tableId));
    }
    
    // If any table is unchecked, selectAll should be false
    if (!checked && selectAllTables) {
      setSelectAllTables(false);
    }
    
    // If all tables are checked, selectAll should be true
    if (checked && selectedTables.length + 1 === tables.length) {
      setSelectAllTables(true);
      setSelectedTables([]);
    }
  };
  
  const handleCreateAnnouncement = () => {
    if (!announcementText) return;
    
    const newAnnouncement = createAnnouncement({
      text: announcementText,
      targetTables: selectAllTables ? null : selectedTables
    });
    
    refreshAnnouncements();
    setShowAddAnnouncement(false);
    resetForm();
    
    toast({
      title: "Announcement Created",
      description: "The announcement has been sent to the selected tables.",
    });
  };
  
  const resetForm = () => {
    setAnnouncementText('');
    setSelectedTables([]);
    setSelectAllTables(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // For table admin, filter to only show announcements for their table
  const filteredAnnouncements = announcements.filter(announcement => {
    if (currentUser?.role === 'table-admin' && currentUser.tableNumber) {
      return announcement.targetTables === null || 
        announcement.targetTables.includes(currentUser.tableNumber);
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <Dialog open={showAddAnnouncement} onOpenChange={setShowAddAnnouncement}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to be displayed to tables.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-text">Announcement Text</Label>
                <Input
                  id="announcement-text"
                  placeholder="Enter announcement text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-tables"
                    checked={selectAllTables}
                    onCheckedChange={handleSelectAllTablesChange}
                  />
                  <Label htmlFor="all-tables">All Tables</Label>
                </div>
                
                {!selectAllTables && (
                  <div className="space-y-2 ml-6 mt-2">
                    <Label className="text-sm">Select Target Tables</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {tables
                        .filter(table => table.status === 'active')
                        .map((table) => (
                          <div key={table.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`table-${table.id}`}
                              checked={selectedTables.includes(table.id)}
                              onCheckedChange={(checked) => 
                                handleTableSelectionChange(table.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`table-${table.id}`} className="text-sm">
                              Table {table.id}
                            </Label>
                          </div>
                        ))}
                    </div>
                    
                    {tables.filter(table => table.status === 'active').length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No active tables available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAnnouncement(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAnnouncement}
                disabled={!announcementText || (!selectAllTables && selectedTables.length === 0)}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No announcements found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start">
                  {announcement.targetTables === null ? (
                    <BellRing className="h-5 w-5 mr-4 text-primary flex-shrink-0 mt-1" />
                  ) : (
                    <Volume2 className="h-5 w-5 mr-4 text-primary flex-shrink-0 mt-1" />
                  )}
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {announcement.targetTables === null 
                          ? 'System-wide Announcement' 
                          : `Announcement for Table${announcement.targetTables.length > 1 ? 's' : ''} ${announcement.targetTables.join(', ')}`
                        }
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(announcement.timestamp)}
                      </span>
                    </div>
                    
                    <p className="mt-2">{announcement.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
