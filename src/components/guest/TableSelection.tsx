import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableSeatSelection } from '@/hooks/use-table-seat-selection';
import { TableSelect } from './components/TableSelect';
import { SeatSelect } from './components/SeatSelect';
import { TableJoinButton } from './components/TableJoinButton';

export const TableSelection = () => {
  const [loading, setLoading] = useState(false);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    tables,
    selectedTable,
    selectedSeat,
    availableSeats,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    setSelectedTable,
    setSelectedSeat,
    handleRefresh
  } = useTableSeatSelection();

  const handleJoinTable = async () => {
    if (!selectedTable || !selectedSeat || !user) return;

    setLoading(true);
    try {
      const tableId = parseInt(selectedTable, 10);
      
      const { data: seatCheck, error: checkError } = await supabase
        .from('seats')
        .select('*')
        .eq('table_id', tableId)
        .eq('code', selectedSeat)
        .is('user_id', null)
        .maybeSingle();

      if (checkError) {
        throw new Error('Unable to verify seat availability');
      }

      if (!seatCheck) {
        throw new Error('This seat is no longer available');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          table_number: tableId,
          seat_code: selectedSeat
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      const { error: seatError } = await supabase
        .from('seats')
        .update({ user_id: user.id })
        .eq('table_id', tableId)
        .eq('code', selectedSeat);

      if (seatError) {
        throw seatError;
      }

      toast({
        title: "Table Joined",
        description: `You've been assigned to Table ${selectedTable}, Seat ${selectedSeat}`,
      });

      window.location.reload();
      
    } catch (error: any) {
      console.error('Error joining table:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join table. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToMain = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, redirect to home page
      navigate('/');
    }
  };

  const handleManualRefresh = () => {
    setIsManualRefresh(true);
    handleRefresh().finally(() => {
      setIsManualRefresh(false);
    });
  };

  const renderTablesFallback = () => {
    if (hasAttemptedFetch && tables.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No tables are currently available.</p>
          <Button onClick={handleManualRefresh} disabled={refreshing || isManualRefresh}>
            {(refreshing || isManualRefresh) ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Tables
              </>
            )}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Button
        variant="outline"
        size="sm"
        className="mb-6 flex items-center"
        onClick={handleReturnToMain}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Main
      </Button>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Select Your Table</CardTitle>
              <CardDescription>
                Choose an available table and seat to join
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManualRefresh} 
              disabled={refreshing || isManualRefresh}
              className="p-1 h-8 w-8"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${(refreshing || isManualRefresh) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderTablesFallback()}

          <TableSelect
            tables={tables}
            selectedTable={selectedTable}
            onTableSelect={(value) => {
              setSelectedTable(value);
              setSelectedSeat('');
            }}
            loadingData={loadingData || isManualRefresh}
          />

          <SeatSelect
            selectedTable={selectedTable}
            selectedSeat={selectedSeat}
            availableSeats={availableSeats}
            onSeatSelect={setSelectedSeat}
            loadingData={loadingData || isManualRefresh}
          />
        </CardContent>

        <CardFooter>
          <TableJoinButton
            onJoin={handleJoinTable}
            disabled={!selectedTable || !selectedSeat || loading || loadingData || isManualRefresh}
            loading={loading}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
