import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Role, getUsers, createUser, updateUser, deleteUser, getTables } from '@/lib/mockDb';
import { Edit, Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add table selection state
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('table-admin');
  const [isActive, setIsActive] = useState(true);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const tables = getTables(); // Get available tables

  // Access control - only user-admin and super-admin can access
  if (currentUser?.role !== 'super-admin' && currentUser?.role !== 'user-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage users.
              Only User Admins and Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const refreshUsers = () => {
    setUsers(getUsers());
  };
  
  const filteredUsers = users.filter(user => {
    // Don't show guests in the user list
    if (user.role === 'guest') return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  const handleAddUser = () => {
    if (!firstName || !lastName || !username || !password) return;
    
    const newUser = createUser({
      firstName,
      lastName,
      username,
      password,
      role,
      status: isActive ? 'active' : 'inactive',
      tableNumber: role === 'table-admin' && selectedTable ? Number(selectedTable) : undefined
    });
    
    refreshUsers();
    setShowAddUser(false);
    resetForm();
    
    toast({
      title: "User Created",
      description: `${firstName} ${lastName} has been added as a ${role.replace('-', ' ')}.`,
    });
  };
  
  const handleEditUser = () => {
    if (!selectedUser || !firstName || !lastName) return;
    
    const updates: Partial<User> = {
      firstName,
      lastName,
      role,
      status: isActive ? 'active' : 'inactive',
      tableNumber: role === 'table-admin' && selectedTable ? Number(selectedTable) : undefined
    };
    
    if (password) {
      updates.password = password;
    }
    
    updateUser(selectedUser.id, updates);
    
    refreshUsers();
    setShowEditUser(false);
    resetForm();
    
    toast({
      title: "User Updated",
      description: `${firstName} ${lastName}'s information has been updated.`,
    });
  };
  
  const handleDeleteUser = (id: string) => {
    // Prevent deleting yourself
    if (id === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      const userToDelete = users.find(u => u.id === id);
      deleteUser(id);
      refreshUsers();
      
      toast({
        title: "User Deleted",
        description: `${userToDelete?.firstName} ${userToDelete?.lastName} has been removed.`,
      });
    }
  };
  
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setUsername('');
    setPassword('');
    setRole('table-admin');
    setIsActive(true);
    setSelectedUser(null);
    setSelectedTable(null);
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setUsername(user.username || '');
    setPassword('');
    setRole(user.role);
    setIsActive(user.status === 'active');
    setSelectedTable(user.tableNumber?.toString() || null);
    setShowEditUser(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Username for login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Access Level</Label>
                <Select value={role} onValueChange={(value) => {
                  setRole(value as Role);
                  if (value !== 'table-admin') {
                    setSelectedTable(null);
                  }
                }}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Super admin can create any role */}
                    {currentUser?.role === 'super-admin' && (
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    )}
                    {/* Both super-admin and user-admin can create user-admin and table-admin */}
                    <SelectItem value="user-admin">User Admin</SelectItem>
                    <SelectItem value="table-admin">Table Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {role === 'table-admin' && (
                <div className="space-y-2">
                  <Label htmlFor="table">Assigned Table</Label>
                  <Select
                    value={selectedTable || ''}
                    onValueChange={setSelectedTable}
                  >
                    <SelectTrigger id="table">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          Table {table.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input
                  id="edit-first-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input
                  id="edit-last-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Access Level</Label>
              <Select value={role} onValueChange={(value) => {
                setRole(value as Role);
                if (value !== 'table-admin') {
                  setSelectedTable(null);
                }
              }}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.role === 'super-admin' && (
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  )}
                  {/* Both super-admin and user-admin can edit to user-admin or table-admin roles */}
                  <SelectItem value="user-admin">User Admin</SelectItem>
                  <SelectItem value="table-admin">Table Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {role === 'table-admin' && (
              <div className="space-y-2">
                <Label htmlFor="edit-table">Assigned Table</Label>
                <Select
                  value={selectedTable || ''}
                  onValueChange={setSelectedTable}
                >
                  <SelectTrigger id="edit-table">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id.toString()}>
                        Table {table.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
            <Button variant="outline" onClick={() => setShowEditUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Users Table */}
      <div className="bg-card rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-left font-medium">Permission Type</th>
                <th className="px-4 py-3 text-left font-medium">Assigned Table</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Last Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      {user.role.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'table-admin' 
                        ? user.tableNumber 
                          ? `Table ${user.tableNumber}`
                          : 'Not assigned'
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(user.lastActive)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
