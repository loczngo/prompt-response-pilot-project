
import { Table } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
                <SelectItem key={table.id} value={table.id.toString()} className="flex items-center">
                  Table {table.id} {' '}
                  <Badge variant={table.status === 'active' ? 'outline' : 'secondary'} className="ml-2">
                    {table.status}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onTableSelect}>View Table</Button>
          {selectedTable && selectedTableObj && (
            <Button 
              variant={selectedTableObj.status === 'active' ? 'destructive' : 'default'}
              onClick={() => onTableStatusToggle(selectedTable)}
              className="transition-colors"
            >
              {selectedTableObj.status === 'active' ? 'Disable' : 'Enable'} Table
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
