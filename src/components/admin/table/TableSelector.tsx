
import { Table } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TableSelectorProps {
  tables: Table[];
  tableNumber: string;
  selectedTable: string;
  onTableNumberChange: (value: string) => void;
  onTableSelect: () => void;
  onTableStatusToggle: (tableId: string) => void;
}

export const TableSelector = ({
  tables,
  tableNumber,
  selectedTable,
  onTableNumberChange,
  onTableSelect,
  onTableStatusToggle
}: TableSelectorProps) => {
  // Find the selected table object for status display
  const selectedTableObj = tables.find(t => t.id.toString() === selectedTable);

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
          {selectedTable && selectedTableObj && (
            <Button 
              variant="outline"
              onClick={() => onTableStatusToggle(selectedTable)}
              className={selectedTableObj.status === 'active' ? 'bg-destructive/10' : 'bg-primary/10'}
            >
              {selectedTableObj.status === 'active' ? 'Disable' : 'Enable'} Table
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
