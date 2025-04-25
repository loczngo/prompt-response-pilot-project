
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Table, Seat, User, Prompt, Response, getTables, getTable, updateTable, updateTableSeat, getPrompts, getResponses, getUsers, createResponse, deleteResponse } from '@/lib/mockDb';
import { useTableManagement } from '@/hooks/use-table-management';
import { TableSelector } from './table/TableSelector';
import { TableManagementSection } from './table/TableManagementSection';
import { TableResponsesSection } from './table/TableResponsesSection';
import { TableControlsSection } from './table/TableControlsSection';
import { SendMessageDialog } from './table/actions/SendMessageDialog';
import { PlayerDealerDialog } from './table/actions/PlayerDealerDialog';
import { CreateTableDialog } from './table/actions/CreateTableDialog';

const Tables = () => {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPlayerDealerDialog, setShowPlayerDealerDialog] = useState(false);
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const {
    tables,
    allTables,
    tableNumber,
    selectedTable,
    setTableNumber,
    handleRefresh,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle,
    removeUserFromSeat,
    fetchAllTables
  } = useTableManagement(currentUser?.role === 'table-admin' ? currentUser.tableNumber?.toString() : undefined);

  if (currentUser?.role !== 'super-admin' && currentUser?.role !== 'table-admin') {
    return (
      <Card className="w-full max-w-md">
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

  const showTableSelector = currentUser?.role === 'super-admin';
  const isTableAdminWithoutTable = currentUser?.role === 'table-admin' && !currentUser?.tableNumber;

  const handleSendMessage = (message: string) => {
    if (!selectedTable || !message) return;
    
    toast({
      title: "Message Sent",
      description: `Message has been sent to Table ${selectedTable}.`,
    });
    setShowMessageDialog(false);
  };

  const handlePlayerDealerSelect = (seatCode: string) => {
    if (!selectedTable) return;
    
    toast({
      title: "Player-Dealer Query Sent",
      description: `Sent query to seat ${seatCode}.`,
    });
  };

  const handleCreateTable = async (seats: number) => {
    try {
      // Create a new table in Supabase
      const { data: newTableData, error: tableError } = await supabase
        .from('tables')
        .insert({ status: 'active' })
        .select()
        .single();
      
      if (tableError) {
        throw tableError;
      }
      
      // Create seats for the new table
      const seatsToInsert = Array.from({ length: seats }, (_, i) => ({
        table_id: newTableData.id,
        code: String.fromCharCode(65 + i), // A, B, C, etc.
        status: 'active',
        is_dealer: false
      }));
      
      const { error: seatsError } = await supabase
        .from('seats')
        .insert(seatsToInsert);
      
      if (seatsError) {
        throw seatsError;
      }
      
      // Refresh the tables data
      fetchAllTables();
      handleRefresh();
      setShowCreateTableDialog(false);
      
      toast({
        title: "Table Created",
        description: `Table ${newTableData.id} has been created with ${seats} seats.`,
      });
    } catch (error: any) {
      console.error('Error creating table:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create table",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResponse = (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      deleteResponse(responseId);
      toast({
        title: "Response Deleted",
        description: "The response has been removed from the system.",
      });
      handleRefresh();
    }
  };

  const handleRemoveUser = (tableId: number, seatCode: string) => {
    removeUserFromSeat(tableId.toString(), seatCode);
  };

  if (isTableAdminWithoutTable) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-amber-500 font-medium mb-2">No Table Assigned</p>
          <p className="text-muted-foreground">
            You don't have a table assigned to your account. Please contact a Super Admin to assign you a table.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedTableId = selectedTable ? parseInt(selectedTable, 10) : null;
  const selectedTableObj = selectedTableId ? getTable(selectedTableId) : null;

  const handleSendPrompt = () => {
    if (!selectedTable || !selectedPromptId) return;
    
    const tableId = parseInt(selectedTable, 10);
    if (!isNaN(tableId)) {
      updateTable(tableId, { currentPromptId: selectedPromptId });
      handleRefresh();
      
      toast({
        title: "Prompt Sent",
        description: "The prompt has been sent to the table.",
      });
    }
  };

  const displayTables = showTableSelector ? allTables || [] : tables || [];

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
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {showTableSelector && (
        <TableSelector
          tables={displayTables as Table[]}
          tableNumber={tableNumber}
          selectedTable={selectedTable}
          onTableNumberChange={setTableNumber}
          onTableSelect={handleTableSelect}
          onTableStatusToggle={handleTableStatusToggle}
        />
      )}

      {selectedTable && selectedTableObj && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TableManagementSection
            selectedTable={selectedTableObj}
            onSeatStatusToggle={(_, seatCode) => handleSeatStatusToggle(selectedTable, seatCode)}
            onPlayerDealerQuery={() => setShowPlayerDealerDialog(true)}
            onRemoveUser={handleRemoveUser}
          />
          
          <TableControlsSection
            selectedTable={selectedTableObj}
            selectedPromptId={selectedPromptId}
            onPromptSelect={setSelectedPromptId}
            onSendPrompt={handleSendPrompt}
          />
          
          <TableResponsesSection
            selectedTable={selectedTableObj}
            onDeleteResponse={handleDeleteResponse}
          />
        </div>
      )}

      <SendMessageDialog
        tableId={selectedTable || ''}
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        onSendMessage={handleSendMessage}
      />

      {selectedTable && selectedTableObj && (
        <PlayerDealerDialog
          selectedTable={selectedTableObj}
          open={showPlayerDealerDialog}
          onOpenChange={setShowPlayerDealerDialog}
          onPlayerDealerSelect={handlePlayerDealerSelect}
        />
      )}

      <CreateTableDialog
        open={showCreateTableDialog}
        onOpenChange={setShowCreateTableDialog}
        onCreateTable={handleCreateTable}
      />
    </div>
  );
};

export default Tables;
