
import { Table } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TableSelectorProps {
  tables: Table[];
  tableNumber: string;
  selectedTable: Table | null;
  onTableNumberChange: (value: string) => void;
  onTableSelect: () => void;
  onTableStatusToggle: (tableId: number) => void;
}

export const TableSelector = ({
  tables,
  tableNumber,
  selectedTable,
  onTableNumberChange,
  onTableSelect,
  onTableStatusToggle
}: TableSelectorProps) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <Label htmlFor="table-number">Select Table</Label>
        <div className="flex space-x-4 mt-2">
          <Select 
            value={tableNumber} 
            onValueChange={onTableNumberChange}
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
          <Button onClick={onTableSelect}>View Table</Button>
          {selectedTable && (
            <Button 
              variant="outline"
              onClick={() => onTableStatusToggle(selectedTable.id)}
              className={selectedTable.status === 'active' ? 'bg-destructive/10' : 'bg-primary/10'}
            >
              {selectedTable.status === 'active' ? 'Disable' : 'Enable'} Table
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
