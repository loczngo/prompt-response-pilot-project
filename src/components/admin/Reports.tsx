
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Download, Filter, Printer, Search } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTables, getUsers, getResponses, Table, User, Response } from '@/lib/mockDb';

type ReportFilters = {
  table: string;
  seatCode: string;
  activity: string;
  playerDealerStatus: string;
  gameType: string;
  tableAdmin: string;
  date: Date | undefined;
  timeFrom: string;
  timeTo: string;
};

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    table: '',
    seatCode: '',
    activity: '',
    playerDealerStatus: '',
    gameType: '',
    tableAdmin: '',
    date: undefined,
    timeFrom: '',
    timeTo: ''
  });
  
  const [results, setResults] = useState<Response[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // Access control - only super-admin can access
  if (currentUser?.role !== 'super-admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access reports.
              Only Super Admins can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const tables = getTables();
  const tableAdmins = getUsers().filter(user => user.role === 'table-admin');
  
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSearch = () => {
    // In a real app, this would query a database with the filters
    // For our POC, we'll simulate by filtering the responses
    const allResponses = getResponses();
    
    const filteredResults = allResponses.filter(response => {
      // Filter by table if specified
      if (filters.table && response.tableNumber.toString() !== filters.table) {
        return false;
      }
      
      // Filter by seat code if specified
      if (filters.seatCode && response.seatCode !== filters.seatCode.toUpperCase()) {
        return false;
      }
      
      // Filter by activity (response type) if specified
      if (filters.activity && response.answer !== filters.activity) {
        return false;
      }
      
      // For date filtering - would implement in a real app
      // Would check if response.timestamp matches the selected date
      
      return true;
    });
    
    setResults(filteredResults);
    setShowResults(true);
    setCurrentPage(1);
    
    toast({
      title: "Search Complete",
      description: `Found ${filteredResults.length} results matching your criteria.`,
    });
  };
  
  const handleReset = () => {
    setFilters({
      table: '',
      seatCode: '',
      activity: '',
      playerDealerStatus: '',
      gameType: '',
      tableAdmin: '',
      date: undefined,
      timeFrom: '',
      timeTo: ''
    });
    setShowResults(false);
    setResults([]);
  };
  
  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your report is being exported as CSV.",
    });
    
    // In a real app, this would generate and download a CSV file
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your CSV file has been downloaded.",
      });
    }, 1500);
  };
  
  const handlePrintReport = () => {
    toast({
      title: "Print Started",
      description: "Your report is being prepared for printing.",
    });
    
    // In a real app, this would open a print dialog
    setTimeout(() => {
      toast({
        title: "Print Ready",
        description: "Your report has been sent to the printer.",
      });
    }, 1500);
  };
  
  // Pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(results.length / resultsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>
      
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search Filters
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Table Filter */}
            <div className="space-y-2">
              <Label htmlFor="table-filter">Table</Label>
              <Select
                value={filters.table}
                onValueChange={(value) => updateFilter('table', value)}
              >
                <SelectTrigger id="table-filter">
                  <SelectValue placeholder="All Tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tables</SelectItem>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Table {table.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Seat Code Filter */}
            <div className="space-y-2">
              <Label htmlFor="seat-filter">Seat Code</Label>
              <Input
                id="seat-filter"
                placeholder="e.g., A, B, C"
                value={filters.seatCode}
                onChange={(e) => updateFilter('seatCode', e.target.value)}
              />
            </div>
            
            {/* Activity Filter */}
            <div className="space-y-2">
              <Label htmlFor="activity-filter">Activity</Label>
              <Select
                value={filters.activity}
                onValueChange={(value) => updateFilter('activity', value)}
              >
                <SelectTrigger id="activity-filter">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Activities</SelectItem>
                  <SelectItem value="YES">YES Responses</SelectItem>
                  <SelectItem value="NO">NO Responses</SelectItem>
                  <SelectItem value="SERVICE">Service Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Player-Dealer Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="dealer-filter">Player-Dealer Status</Label>
              <Select
                value={filters.playerDealerStatus}
                onValueChange={(value) => updateFilter('playerDealerStatus', value)}
              >
                <SelectTrigger id="dealer-filter">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Status</SelectItem>
                  <SelectItem value="dealer">Is Dealer</SelectItem>
                  <SelectItem value="not-dealer">Not Dealer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Game Type Filter (mock) */}
            <div className="space-y-2">
              <Label htmlFor="game-filter">Game Type</Label>
              <Select
                value={filters.gameType}
                onValueChange={(value) => updateFilter('gameType', value)}
              >
                <SelectTrigger id="game-filter">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Games</SelectItem>
                  <SelectItem value="poker">Poker</SelectItem>
                  <SelectItem value="blackjack">Blackjack</SelectItem>
                  <SelectItem value="roulette">Roulette</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Table Admin Filter */}
            <div className="space-y-2">
              <Label htmlFor="admin-filter">Table Admin</Label>
              <Select
                value={filters.tableAdmin}
                onValueChange={(value) => updateFilter('tableAdmin', value)}
              >
                <SelectTrigger id="admin-filter">
                  <SelectValue placeholder="Any Admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Admin</SelectItem>
                  {tableAdmins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.firstName} {admin.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-filter">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? format(filters.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(date) => updateFilter('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Range Filters */}
            <div className="space-y-2">
              <Label htmlFor="time-from">Time From</Label>
              <Input
                id="time-from"
                type="time"
                value={filters.timeFrom}
                onChange={(e) => updateFilter('timeFrom', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-to">Time To</Label>
              <Input
                id="time-to"
                type="time"
                value={filters.timeTo}
                onChange={(e) => updateFilter('timeTo', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Table</th>
                    <th className="px-4 py-3 text-left font-medium">Seat</th>
                    <th className="px-4 py-3 text-left font-medium">Guest</th>
                    <th className="px-4 py-3 text-left font-medium">Response</th>
                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResults.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No results match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    currentResults.map((result) => {
                      const user = getUsers().find(u => u.id === result.userId);
                      
                      return (
                        <tr key={result.id} className="border-b">
                          <td className="px-4 py-3">Table {result.tableNumber}</td>
                          <td className="px-4 py-3">Seat {result.seatCode}</td>
                          <td className="px-4 py-3">
                            {user ? `${user.firstName} ${user.lastName}` : 'Unknown Guest'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              result.answer === 'YES' 
                                ? 'bg-green-100 text-green-800' 
                                : result.answer === 'NO'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {result.answer}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {format(new Date(result.timestamp), "MMM d, yyyy h:mm a")}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {results.length > resultsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {indexOfFirstResult + 1} to {Math.min(indexOfLastResult, results.length)} of {results.length} results
                </p>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && <span className="px-2">...</span>}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
