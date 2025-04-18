
import { Table, getPrompts, getUsers, getResponses } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

interface TableResponsesSectionProps {
  selectedTable: Table;
  onDeleteResponse: (responseId: string) => void;
}

export const TableResponsesSection = ({
  selectedTable,
  onDeleteResponse
}: TableResponsesSectionProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const tableResponses = getResponses()
    .filter(r => r.tableNumber === selectedTable.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table {selectedTable.id} Responses</CardTitle>
        <CardDescription>
          View all player responses from this table
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Guest Name</th>
                <th className="px-4 py-3 text-left font-medium">Prompt Question</th>
                <th className="px-4 py-3 text-left font-medium">Response</th>
                <th className="px-4 py-3 text-left font-medium">Seat</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No responses recorded for this table.
                  </td>
                </tr>
              ) : (
                tableResponses.map((response) => {
                  const prompt = getPrompts().find(p => p.id === response.promptId);
                  const user = getUsers().find(u => u.id === response.userId);
                  
                  return (
                    <tr key={response.id} className="border-b">
                      <td className="px-4 py-3">
                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown Guest'}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {prompt?.text || 'Unknown prompt'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          response.answer === 'YES' 
                            ? 'bg-green-100 text-green-800' 
                            : response.answer === 'NO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {response.answer}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {response.seatCode}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(response.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8"
                          onClick={() => onDeleteResponse(response.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
