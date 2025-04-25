
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Table, User, getTables, updateTable, createResponse, deleteResponse } from '@/lib/mockDb';
import { RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTableManagement } from '@/hooks/use-table-management';
import { TableSelector } from './table/TableSelector';
import { TableManagementSection } from './table/TableManagementSection';
import { TableControlsSection } from './table/TableControlsSection';
import { TableResponsesSection } from './table/TableResponsesSection';

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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            You don't have permission to manage tables.
            Only Table Admins and Super Admins can access this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSendPrompt = () => {
    if (!selectedTable || !selectedPromptId) return;
    
    updateTable(selectedTable.id, { currentPromptId: selectedPromptId });
    refreshTables();
    
    toast({
      title: "Prompt Sent",
      description: "The prompt has been sent to the table.",
    });
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

  const handlePlayerDealerQuery = () => {
    if (!selectedTable) return;
    setShowPlayerDealerDialog(true);
  };

  const handleCreateTable = () => {
    const tables = getTables();
    const newTableId = Math.max(...tables.map(t => t.id), 0) + 1;
    
    const newSeats = Array.from({ length: newTableSeats }, (_, i) => ({
      id: tables.length * 100 + i + 1,
      tableId: newTableId,
      code: String.fromCharCode(65 + i),
      status: 'available' as const,  // Using as const to ensure correct typing
      isDealer: false,
      userId: undefined,
      dealerHandsLeft: 0
    }));
    
    const newTable: Table = {
      id: newTableId,
      status: 'active',
      seats: newSeats,
      currentPromptId: undefined
    };
    
    updateTable(newTableId, newTable);
    refreshTables();
    setShowCreateTableDialog(false);
    
    toast({
      title: "Table Created",
      description: `Table ${newTableId} has been created with ${newTableSeats} seats.`,
    });
  };

  const showTableSelector = currentUser?.role === 'super-admin';
  const isTableAdminWithoutTable = currentUser?.role === 'table-admin' && !currentUser?.tableNumber;

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

      {selectedTable && (
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
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowMessageDialog(true)}
                    >
                      Send Table Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="responses">
            <TableResponsesSection
              selectedTable={selectedTable}
              onDeleteResponse={deleteResponse}
            />
          </TabsContent>
        </Tabs>
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
