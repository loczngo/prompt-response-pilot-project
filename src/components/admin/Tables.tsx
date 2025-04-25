import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  Seat, 
  User, 
  Prompt, 
  Response,
  getTables, 
  getTable, 
  updateTable, 
  updateTableSeat, 
  getPrompts, 
  getResponses,
  getUsers,
  createResponse,
  deleteResponse
} from '@/lib/mockDb';
import { 
  ArrowDown, 
  ArrowUpDown, 
  Download, 
  MessageSquare, 
  Printer, 
  RefreshCcw, 
  Send, 
  UserCheck, 
  UserX 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { useTableManagement } from '@/hooks/use-table-management';
import { TableSelector } from './table/TableSelector';
import { TableManagementSection } from './table/TableManagementSection';
import { TableControlsSection } from './table/TableControlsSection';
import { TableResponsesSection } from './table/TableResponsesSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { supabase } from '@/integrations/supabase/client';

const Tables = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [tableMessage, setTableMessage] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPlayerDealerDialog, setShowPlayerDealerDialog] = useState(false);
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState<number>(6);

  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const {
    tables: realtimeTables,
    tableNumber,
    selectedTable,
    setTableNumber,
    refreshTables,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle
  } = useTableManagement(currentUser?.role === 'table-admin' ? currentUser.tableNumber : undefined);

  if (currentUser?.role !== 'super-admin' && currentUser?.role !== 'table-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage tables.
              Only Table Admins and Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showTableSelector = currentUser?.role === 'super-admin';
  const isTableAdminWithoutTable = currentUser?.role === 'table-admin' && !currentUser?.tableNumber;

  const handleSendPrompt = async () => {
    if (!selectedTable || !selectedPromptId) return;
    
    try {
      console.log(`Sending prompt ${selectedPromptId} to table ${selectedTable.id}`);
      
      const { error } = await supabase
        .from('tables')
        .update({ 
          status: selectedTable.status,
          current_prompt_id: selectedPromptId 
        })
        .eq('id', selectedTable.id);
      
      if (error) {
        console.error('Error sending prompt:', error);
        throw error;
      }
      
      refreshTables();
      
      toast({
        title: "Prompt Sent",
        description: "The prompt has been sent to the table.",
      });
    } catch (error) {
      console.error('Error sending prompt:', error);
      toast({
        title: "Error Sending Prompt",
        description: "Failed to send prompt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = () => {
    if (!selectedTable || !tableMessage) return;
    
    toast({
      title: "Message Sent",
      description: `Message has been sent to Table ${selectedTable.id}.`,
    });
    
    setTableMessage('');
    setShowMessageDialog(false);
  };

  const handleExportData = () => {
    if (!selectedTable) return;
    
    toast({
      title: "Data Exported",
      description: `Table ${selectedTable.id} data has been exported.`,
    });
  };

  const handlePrintReport = () => {
    if (!selectedTable) return;
    
    toast({
      title: "Report Printed",
      description: `Table ${selectedTable.id} report has been sent to printer.`,
    });
  };

  const handlePlayerDealerQuery = () => {
    if (!selectedTable) return;
    setShowPlayerDealerDialog(true);
  };

  const handleDeleteResponse = (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      deleteResponse(responseId);
      toast({
        title: "Response Deleted",
        description: "The response has been removed from the system.",
      });
      refreshTables();
    }
  };

  const handleCreateTable = () => {
    const tables = getTables();
    const newTableId = Math.max(...tables.map(t => t.id), 0) + 1;
    
    const newTable: Table = {
      id: newTableId,
      status: 'active',
      seats: Array.from({ length: newTableSeats }, (_, i) => ({
        code: String.fromCharCode(65 + i), // A, B, C, etc.
        status: 'active',
        isDealer: false
      }))
    };

    localStorage.setItem('prs_tables', JSON.stringify([...tables, newTable]));
    refreshTables();
    setShowCreateTableDialog(false);
    
    toast({
      title: "Table Created",
      description: `Table ${newTableId} has been created with ${newTableSeats} seats.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
        <div className="flex space-x-4">
          {currentUser?.role === 'super-admin' && (
            <Button onClick={() => setShowCreateTableDialog(true)}>
              Create New Table
            </Button>
          )}
          <Button onClick={refreshTables}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isTableAdminWithoutTable && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-amber-500 font-medium mb-2">No Table Assigned</p>
            <p className="text-muted-foreground">
              You don't have a table assigned to your account. Please contact a Super Admin to assign you a table.
            </p>
          </CardContent>
        </Card>
      )}

      {showTableSelector && (
        <TableSelector
          tables={realtimeTables}
          tableNumber={tableNumber}
          selectedTable={selectedTable}
          onTableNumberChange={setTableNumber}
          onTableSelect={handleTableSelect}
          onTableStatusToggle={handleTableStatusToggle}
        />
      )}

      {selectedTable ? (
        <Tabs defaultValue="management">
          <TabsList className="mb-4">
            <TabsTrigger value="management">Table Management</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TableManagementSection
                selectedTable={selectedTable}
                onSeatStatusToggle={handleSeatStatusToggle}
                onPlayerDealerQuery={handlePlayerDealerQuery}
              />
              
              <TableControlsSection
                selectedTable={selectedTable}
                selectedPromptId={selectedPromptId}
                onPromptSelect={setSelectedPromptId}
                onSendPrompt={handleSendPrompt}
              />
              
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Administrative Actions</CardTitle>
                  <CardDescription>
                    Manage table operations
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowMessageDialog(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Table Message
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handlePrintReport}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Report
                    </Button>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-sm font-medium mb-4">Table Statistics</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Occupied Seats:</span>
                          <span className="font-medium">
                            {selectedTable.seats.filter(s => s.status === 'active' && s.userId).length} / 
                            {selectedTable.seats.filter(s => s.status === 'active').length}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Response Rate:</span>
                          <span className="font-medium">
                            {/* {tableResponses.length > 0 ? 
                              Math.round((tableResponses.length / selectedTable.seats.filter(s => s.status === 'active').length) * 100) + '%' : 
                              '0%'
                            } */}0%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Rating:</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedTable.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="responses">
            <TableResponsesSection
              selectedTable={selectedTable}
              onDeleteResponse={handleDeleteResponse}
            />
          </TabsContent>
        </Tabs>
      ) : (
        !isTableAdminWithoutTable && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {currentUser?.role === 'super-admin' 
                  ? 'Select a table to view and manage' 
                  : 'No table assigned to you'
                }
              </p>
            </CardContent>
          </Card>
        )
      )}

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to Table {selectedTable?.id}</DialogTitle>
            <DialogDescription>
              This message will be displayed to all players at the table.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-message">Message</Label>
              <Input
                id="table-message"
                placeholder="Enter your message..."
                value={tableMessage}
                onChange={(e) => setTableMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!tableMessage}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlayerDealerDialog} onOpenChange={setShowPlayerDealerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Player-Dealer Inquiry</DialogTitle>
            <DialogDescription>
              Select a seat to query for Player-Dealer role
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {selectedTable?.seats
                .filter(seat => seat.status === 'active' && seat.userId && !seat.isDealer)
                .map(seat => {
                  const user = getUsers().find(u => u.id === seat.userId);
                  
                  return (
                    <Button
                      key={seat.code}
                      variant="outline"
                      className="p-4 h-auto"
                      onClick={() => {
                        toast({
                          title: "Player-Dealer Query Sent",
                          description: `Sent query to seat ${seat.code}.`
                        });
                        setShowPlayerDealerDialog(false);
                      }}
                    >
                      <div className="text-center">
                        <div className="font-medium">Seat {seat.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                        </div>
                      </div>
                    </Button>
                  );
                })}
            </div>
            
            {(selectedTable?.seats.filter(seat => 
              seat.status === 'active' && seat.userId && !seat.isDealer
            ).length || 0) === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                No eligible seats available. Seats must be active and occupied.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlayerDealerDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateTableDialog} onOpenChange={setShowCreateTableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Create a new table by specifying the number of seats.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                min={2}
                max={12}
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 6)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTable}>Create Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tables;
