
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface TableSelectProps {
  tables: any[];
  selectedTable: string;
  onTableSelect: (value: string) => void;
  loadingData: boolean;
}

export const TableSelect = ({ tables, selectedTable, onTableSelect, loadingData }: TableSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="table">Table Number</Label>
      <Select
        value={selectedTable}
        onValueChange={onTableSelect}
        disabled={loadingData || tables.length === 0}
      >
        <SelectTrigger id="table" className="w-full">
          <SelectValue placeholder={loadingData ? "Loading tables..." : "Select a table"} />
        </SelectTrigger>
        <SelectContent>
          {tables.length === 0 && !loadingData ? (
            <SelectItem value="no-tables" disabled>No tables available</SelectItem>
          ) : (
            tables.map((table) => (
              <SelectItem key={table.id} value={table.id.toString()}>
                Table {table.id} {' '}
                <Badge variant={table.status === 'active' ? 'outline' : 'secondary'} className="ml-1">
                  {table.seats?.length || 0} seats
                </Badge>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
