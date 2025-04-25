import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTables, getStats, getResponses, getPrompts } from '@/lib/mockDb';
import { BarChart, PieChart, LineChart, RadarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, Line } from 'recharts';
import { AlertTriangle, BellRing, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#9b87f5', '#7E69AB', '#fb923c', '#f43f5e', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState(getStats());
  const [sos, setSos] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Update stats every 10 seconds
    const interval = setInterval(() => {
      setStats(getStats());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePanic = () => {
    setSos(true);
    toast({
      title: "SOS Alert Triggered!",
      description: "Security has been notified. Help is on the way.",
      variant: "destructive",
    });
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSos(false);
    }, 5000);
  };
  
  // Mock response data for charts
  const responseData = [
    { name: 'Yes', value: stats.satisfactionRate },
    { name: 'No', value: 100 - stats.satisfactionRate },
  ];
  
  const tables = getTables();
  const tableData = tables.map((table) => ({
    id: table.id,
    activeSeats: table.seats.filter(s => s.status === 'available' || s.status === 'occupied').length,
    inactiveSeats: table.seats.filter(s => s.status === 'unavailable').length,
    name: `Table ${table.id}`,
  }));
  
  const responses = getResponses();
  const prompts = getPrompts();
  
  // Response distribution by type
  const responseTypeData = [
    { name: 'YES', count: responses.filter(r => r.answer === 'YES').length },
    { name: 'NO', count: responses.filter(r => r.answer === 'NO').length },
    { name: 'SERVICE', count: responses.filter(r => r.answer === 'SERVICE').length },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button 
          variant="destructive"
          size="lg"
          className={`${sos ? 'animate-pulse' : ''}`}
          onClick={handlePanic}
          disabled={sos}
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          {sos ? 'SOS Alert Sent!' : 'Emergency Panic Button'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeTables}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {tables.length} total tables
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSeats}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.occupiedSeats} occupied ({Math.round((stats.occupiedSeats / stats.activeSeats) * 100)}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.serviceRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={responseTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {responseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Seats by Table</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tableData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeSeats" name="Active Seats" fill="#9b87f5" />
                <Bar dataKey="inactiveSeats" name="Inactive Seats" fill="#7E69AB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start p-4 rounded-lg bg-accent">
              <Volume2 className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">System Announcement</h4>
                <p className="text-sm text-muted-foreground">
                  Welcome to the Prompt and Response System demo! This is a proof-of-concept demonstration.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Just now</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg bg-accent">
              <BellRing className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">Table 1 Notification</h4>
                <p className="text-sm text-muted-foreground">
                  New Player-Dealer rotation will begin in 15 minutes.
                </p>
                <p className="text-xs text-muted-foreground mt-2">5 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
