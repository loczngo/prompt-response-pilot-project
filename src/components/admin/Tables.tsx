
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const Tables = () => {
  const [tables, setTables] = useState<Table[]>(getTables());
  const [tableNumber, setTableNumber] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [tableMessage, setTableMessage] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPlayerDealerDialog, setShowPlayerDealerDialog] = useState(false);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Access control - only table-admin and super-admin can access
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
  
  // Table admin can only manage their assigned table
  useEffect(() => {
    if (currentUser?.role === 'table-admin' && currentUser?.tableNumber) {
      setTableNumber(currentUser.tableNumber.toString());
      handleTableSelect();
    }
  }, [currentUser]);
  
  const refreshTables = () => {
    setTables(getTables());
    if (selectedTable) {
      setSelectedTable(getTable(selectedTable.id));
    }
  };
  
  const handleTableSelect = () => {
    if (!tableNumber) {
      setSelectedTable(null);
      return;
    }
    
    const table = getTable(Number(tableNumber));
    setSelectedTable(table || null);
    
    if (!table) {
      toast({
        title: "Table Not Found",
        description: `Table ${tableNumber} does not exist.`,
        variant: "destructive",
      });
    } else {
      // Set the current prompt if available
      if (table.currentPromptId) {
        setSelectedPromptId(table.currentPromptId);
      }
    }
  };
  
  const handleSeatStatusToggle = (seatCode: string) => {
    if (!selectedTable) return;
    
    const seat = selectedTable.seats.find(s => s.code === seatCode);
    if (!seat) return;
    
    const newStatus = seat.status === 'active' ? 'inactive' : 'active';
    
    updateTableSeat(selectedTable.id, seatCode, { status: newStatus });
    refreshTables();
    
    toast({
      title: `Seat ${seatCode} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `Seat ${seatCode} is now ${newStatus}.`,
    });
  };
  
  const handleSendPrompt = () => {
    if (!selectedTable || !selectedPromptId) return;
    
    updateTable(selectedTable.id, { currentPromptId: selectedPromptId });
    refreshTables();
    
    const prompt = getPrompts().find(p => p.id === selectedPromptId);
    
    toast({
      title: "Prompt Sent",
      description: `"${prompt?.text}" has been sent to Table ${selectedTable.id}.`,
    });
  };
  
  const handleSendMessage = () => {
    if (!selectedTable || !tableMessage) return;
    
    // In a real system, we would send this message to the table
    // For the POC, we'll just show a toast
    toast({
      title: "Message Sent",
      description: `Message has been sent to Table ${selectedTable.id}.`,
    });
    
    setTableMessage('');
    setShowMessageDialog(false);
  };
  
  const handleExportData = () => {
    if (!selectedTable) return;
    
    // In a real system, we would generate a CSV file
    // For the POC, we'll just show a toast
    toast({
      title: "Data Exported",
      description: `Table ${selectedTable.id} data has been exported.`,
    });
  };
  
  const handlePrintReport = () => {
    if (!selectedTable) return;
    
    // In a real system, we would generate a printable report
    // For the POC, we'll just show a toast
    toast({
      title: "Report Printed",
      description: `Table ${selectedTable.id} report has been sent to printer.`,
    });
  };
  
  const initiatePlayerDealerQuery = () => {
    if (!selectedTable) return;
    
    setShowPlayerDealerDialog(true);
  };
  
  const handlePlayerDealerQuery = (seatCode: string) => {
    if (!selectedTable) return;
    
    // Find a prompt for player-dealer or create one
    const promptText = "Would you like to be the player-dealer for the next round?";
    let playerDealerPrompt = getPrompts().find(p => 
      p.text.toLowerCase().includes("player-dealer") && 
      p.targetTable === selectedTable.id
    );
    
    if (!playerDealerPrompt) {
      // For demo purposes, we'll just use an existing prompt with the table's currentPromptId
      playerDealerPrompt = getPrompts().find(p => p.id === selectedTable.currentPromptId);
    }
    
    if (!playerDealerPrompt) {
      toast({
        title: "Error",
        description: "No player-dealer prompt available.",
        variant: "destructive",
      });
      return;
    }
    
    // Update table to show this prompt
    updateTable(selectedTable.id, { currentPromptId: playerDealerPrompt.id });
    
    // Mock a response after 3 seconds
    setTimeout(() => {
      const seat = selectedTable.seats.find(s => s.code === seatCode);
      if (!seat || !seat.userId) return;
      
      // Random response (YES/NO)
      const answer = Math.random() > 0.5 ? 'YES' : 'NO';
      
      createResponse({
        userId: seat.userId,
        promptId: playerDealerPrompt!.id,
        tableNumber: selectedTable.id,
        seatCode,
        answer
      });
      
      if (answer === 'YES') {
        // Update seat to be dealer
        updateTableSeat(selectedTable.id, seatCode, { 
          isDealer: true,
          dealerHandsLeft: 2 // Dealer for two hands
        });
        
        toast({
          title: "Player-Dealer Assigned",
          description: `Seat ${seatCode} has accepted the Player-Dealer role for 2 hands.`,
        });
      } else {
        toast({
          title: "Player-Dealer Declined",
          description: `Seat ${seatCode} has declined the Player-Dealer role.`,
        });
      }
      
      refreshTables();
      setShowPlayerDealerDialog(false);
    }, 3000);
    
    toast({
      title: "Player-Dealer Request Sent",
      description: `Seat ${seatCode} has been prompted to be the Player-Dealer.`,
    });
  };
  
  const deletePlayerResponse = (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      deleteResponse(responseId);
      toast({
        title: "Response Deleted",
        description: "The response has been removed from the system.",
      });
      refreshTables();
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Helper to get username for a seat
  const getUserForSeat = (tableId: number, seatCode: string): User | undefined => {
    const table = getTable(tableId);
    if (!table) return undefined;
    
    const seat = table.seats.find(s => s.code === seatCode);
    if (!seat || !seat.userId) return undefined;
    
    return getUsers().find(u => u.id === seat.userId);
  };
  
  // Get active prompts
  const activePrompts = getPrompts().filter(p => 
    p.status === 'active' && 
    (p.targetTable === null || (selectedTable && p.targetTable === selectedTable.id))
  );
  
  // Get responses for the selected table
  const tableResponses = selectedTable 
    ? getResponses()
        .filter(r => r.tableNumber === selectedTable.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
        <Button onClick={refreshTables}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Table Selector (only for super-admin) */}
      {currentUser?.role === 'super-admin' && (
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="table-number">Select Table</Label>
            <div className="flex space-x-4 mt-2">
              <Select 
                value={tableNumber} 
                onValueChange={setTableNumber}
              >
                <SelectTrigger id="table-number" className="flex-1">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Table {table.id} ({table.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleTableSelect}>View Table</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Table View */}
      {selectedTable ? (
        <Tabs defaultValue="management">
          <TabsList className="mb-4">
            <TabsTrigger value="management">Table Management</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
          
          {/* Table Management Tab */}
          <TabsContent value="management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Seat Management */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Table {selectedTable.id} Seats</CardTitle>
                  <CardDescription>
                    Manage seats and player assignments
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {selectedTable.seats.map((seat) => {
                      const user = seat.userId 
                        ? getUserForSeat(selectedTable.id, seat.code) 
                        : undefined;
                        
                      return (
                        <div 
                          key={seat.code} 
                          className={`p-3 rounded-md border ${
                            seat.status === 'active' 
                              ? 'bg-accent border-primary/30' 
                              : 'bg-muted border-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                                seat.status === 'active' 
                                  ? seat.isDealer 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-accent-foreground/10 text-accent-foreground' 
                                  : 'bg-muted-foreground/20 text-muted-foreground'
                              }`}>
                                {seat.code}
                              </div>
                              <div>
                                <p className="font-medium">
                                  Seat {seat.code}
                                  {seat.isDealer && (
                                    <span className="ml-2 text-xs bg-primary/20 text-primary-foreground px-2 py-1 rounded-full">
                                      Dealer ({seat.dealerHandsLeft} hands left)
                                    </span>
                                  )}
                                </p>
                                {user ? (
                                  <p className="text-sm text-muted-foreground">
                                    {user.firstName} {user.lastName}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    Not occupied
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleSeatStatusToggle(seat.code)}
                              >
                                {seat.status === 'active' ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={initiatePlayerDealerQuery}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Player-Dealer Inquiry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Middle Column - Prompt Management */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Prompt Control</CardTitle>
                  <CardDescription>
                    Send prompts to the table
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-select">Select Prompt</Label>
                      <Select
                        value={selectedPromptId}
                        onValueChange={setSelectedPromptId}
                      >
                        <SelectTrigger id="prompt-select">
                          <SelectValue placeholder="Select prompt" />
                        </SelectTrigger>
                        <SelectContent>
                          {activePrompts.map((prompt) => (
                            <SelectItem key={prompt.id} value={prompt.id}>
                              {prompt.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      className="w-full"
                      disabled={!selectedPromptId}
                      onClick={handleSendPrompt}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Prompt
                    </Button>
                    
                    {/* Current Prompt Display */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Current Prompt</h3>
                      {selectedTable.currentPromptId ? (
                        <div className="p-3 bg-accent rounded-md border border-primary/30">
                          {getPrompts().find(p => p.id === selectedTable.currentPromptId)?.text || 'Unknown prompt'}
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded-md text-muted-foreground">
                          No active prompt
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Right Column - Admin Actions */}
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
                    
                    {/* Stats Display */}
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
                            {tableResponses.length > 0 ? 
                              Math.round((tableResponses.length / selectedTable.seats.filter(s => s.status === 'active').length) * 100) + '%' : 
                              '0%'
                            }
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Rating:</span>
                          <span className="font-medium">
                            {tableResponses.filter(r => r.answer === 'YES').length > 0 ?
                              Math.round((tableResponses.filter(r => r.answer === 'YES').length / 
                                (tableResponses.filter(r => r.answer === 'YES' || r.answer === 'NO').length)) * 5) + '/5' :
                              'N/A'
                            }
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status:</span>
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
          
          {/* Responses Tab */}
          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Table {selectedTable.id} Responses</CardTitle>
                <CardDescription>
                  View all player responses from this table
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium">Guest Name</th>
                        <th className="px-4 py-3 text-left font-medium">Prompt Question</th>
                        <th className="px-4 py-3 text-left font-medium">Response</th>
                        <th className="px-4 py-3 text-left font-medium">Seat</th>
                        <th className="px-4 py-3 text-left font-medium">Time</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableResponses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                            No responses recorded for this table.
                          </td>
                        </tr>
                      ) : (
                        tableResponses.map((response) => {
                          const prompt = getPrompts().find(p => p.id === response.promptId);
                          const user = getUsers().find(u => u.id === response.userId);
                          
                          return (
                            <tr key={response.id} className="border-b">
                              <td className="px-4 py-3">
                                {user ? `${user.firstName} ${user.lastName}` : 'Unknown Guest'}
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate">
                                {prompt?.text || 'Unknown prompt'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  response.answer === 'YES' 
                                    ? 'bg-green-100 text-green-800' 
                                    : response.answer === 'NO'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {response.answer}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {response.seatCode}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatDate(response.timestamp)}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive h-8"
                                  onClick={() => deletePlayerResponse(response.id)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
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
      )}
      
      {/* Send Message Dialog */}
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
      
      {/* Player-Dealer Query Dialog */}
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
                  const user = getUserForSeat(selectedTable.id, seat.code);
                  
                  return (
                    <Button
                      key={seat.code}
                      variant="outline"
                      className="p-4 h-auto"
                      onClick={() => handlePlayerDealerQuery(seat.code)}
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
    </div>
  );
};

export default Tables;
