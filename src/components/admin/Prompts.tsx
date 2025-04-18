
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prompt, getPrompts, createPrompt, updatePrompt, deletePrompt, getTables, Role } from '@/lib/mockDb';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Prompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(getPrompts());
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const [promptText, setPromptText] = useState('');
  const [targetTable, setTargetTable] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const tables = getTables();
  
  if (user?.role !== 'super-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage prompts.
              Only Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const refreshPrompts = () => {
    setPrompts(getPrompts());
  };
  
  const handleAddPrompt = () => {
    if (!promptText) return;
    
    const newPrompt = createPrompt({
      text: promptText,
      targetTable: targetTable ? Number(targetTable) : null,
      status: isActive ? 'active' : 'inactive'
    });
    
    refreshPrompts();
    setShowAddPrompt(false);
    resetForm();
    
    toast({
      title: "Prompt Created",
      description: "The prompt has been successfully created.",
    });
  };
  
  const handleEditPrompt = () => {
    if (!selectedPrompt || !promptText) return;
    
    updatePrompt(selectedPrompt.id, {
      text: promptText,
      targetTable: targetTable ? Number(targetTable) : null,
      status: isActive ? 'active' : 'inactive'
    });
    
    refreshPrompts();
    setShowEditPrompt(false);
    resetForm();
    
    toast({
      title: "Prompt Updated",
      description: "The prompt has been successfully updated.",
    });
  };
  
  const handleDeletePrompt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
      refreshPrompts();
      
      toast({
        title: "Prompt Deleted",
        description: "The prompt has been successfully deleted.",
      });
    }
  };
  
  const resetForm = () => {
    setPromptText('');
    setTargetTable(null);
    setIsActive(true);
    setSelectedPrompt(null);
  };
  
  const openEditDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptText(prompt.text);
    setTargetTable(prompt.targetTable !== null ? prompt.targetTable.toString() : null);
    setIsActive(prompt.status === 'active');
    setShowEditPrompt(true);
  };
  
  const filteredPrompts = prompts.filter(prompt => {
    if (user?.role === 'table-admin') {
      return prompt.targetTable === user.tableNumber || prompt.targetTable === null;
    }
    return true;
  });
  
  // Helper function to determine if user can create/edit prompts
  const canManagePrompts = (role?: Role): boolean => {
    return role === 'super-admin' || role === 'table-admin';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
        {user && canManagePrompts(user.role) && (
          <Dialog open={showAddPrompt} onOpenChange={setShowAddPrompt}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
                <DialogDescription>
                  Create a new prompt to be sent to tables.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-text">Prompt Text</Label>
                  <Input
                    id="prompt-text"
                    placeholder="Enter prompt question"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-table">Target Table</Label>
                  <Select
                    value={targetTable || 'all'}
                    onValueChange={(value) => setTargetTable(value === 'all' ? null : value)}
                    disabled={user?.role === 'table-admin'}
                  >
                    <SelectTrigger id="target-table">
                      <SelectValue placeholder="Select target table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tables</SelectItem>
                      {(user && user.role === 'super-admin' 
                        ? tables 
                        : tables.filter(t => t.id === user?.tableNumber))
                        .map((table) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            Table {table.id}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  {user?.role === 'table-admin' && (
                    <p className="text-xs text-muted-foreground">
                      As a Table Admin, prompts will be automatically targeted to your assigned table.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active-status">Active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddPrompt(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPrompt}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Dialog open={showEditPrompt} onOpenChange={setShowEditPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update the prompt details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prompt-text">Prompt Text</Label>
              <Input
                id="edit-prompt-text"
                placeholder="Enter prompt question"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-target-table">Target Table</Label>
              <Select
                value={targetTable === null ? 'all' : targetTable || 'all'}
                onValueChange={(value) => setTargetTable(value === 'all' ? null : value)}
              >
                <SelectTrigger id="edit-target-table">
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Table {table.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-active-status">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPrompt}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No prompts found. Create your first prompt.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className={prompt.status === 'inactive' ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{prompt.text}</h3>
                    <p className="text-sm text-muted-foreground">
                      Target: {prompt.targetTable === null ? 'All Tables' : `Table ${prompt.targetTable}`}
                    </p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full mr-2 ${
                          prompt.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-xs">
                        {prompt.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(prompt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default Prompts;
