
import { Table } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableSeat } from './TableSeat';
import { ArrowUpDown } from 'lucide-react';

interface TableManagementSectionProps {
  selectedTable: Table;
  onSeatStatusToggle: (tableId: number, seatCode: string) => void;
  onPlayerDealerQuery: () => void;
  onRemoveUser?: (tableId: number, seatCode: string) => void;
}

export const TableManagementSection = ({
  selectedTable,
  onSeatStatusToggle,
  onPlayerDealerQuery,
  onRemoveUser,
}: TableManagementSectionProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Table {selectedTable.id} Seats</CardTitle>
        <CardDescription>
          Manage seats and player assignments
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {selectedTable.seats.map((seat) => (
            <TableSeat
              key={seat.code}
              tableId={selectedTable.id}
              seat={seat}
              onToggleStatus={(seatCode) => onSeatStatusToggle(selectedTable.id, seatCode)}
              onRemoveUser={onRemoveUser ? (seatCode) => onRemoveUser(selectedTable.id, seatCode) : undefined}
            />
          ))}
          
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onPlayerDealerQuery}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Player-Dealer Inquiry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
