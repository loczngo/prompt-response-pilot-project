
import React from 'react';
import { Seat, User, getUsers } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TableSeatProps {
  seat: Seat;
  tableId: number;
  onSeatStatusToggle: () => void;
}

export const TableSeat: React.FC<TableSeatProps> = ({ 
  seat,
  tableId,
  onSeatStatusToggle
}) => {
  const user = seat.userId ? getUsers().find(u => u.id === seat.userId) : null;

  return (
    <div className={`flex flex-col items-center justify-center p-4 border rounded-md ${
      seat.status === 'active' 
        ? 'bg-white' 
        : 'bg-muted/40'
    }`}>
      <div className="text-lg font-semibold">Seat {seat.code}</div>
      
      {user ? (
        <div className="flex flex-col items-center mt-2 space-y-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.firstName} {user.lastName}</span>
          
          {seat.isDealer && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 mt-1">
              {seat.dealerHandsLeft !== undefined && seat.dealerHandsLeft > 0 
                ? `Dealer (${seat.dealerHandsLeft} hands left)` 
                : 'Dealer'}
            </Badge>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-16 mt-2">
          <UserIcon className="h-7 w-7 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mt-1">
            {seat.status === 'active' ? 'Available' : 'Inactive'}
          </span>
        </div>
      )}
      
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSeatStatusToggle}>
              {seat.status === 'active' ? 'Set Inactive' : 'Set Active'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
