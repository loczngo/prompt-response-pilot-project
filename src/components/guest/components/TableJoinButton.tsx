
import { Button } from '@/components/ui/button';

interface TableJoinButtonProps {
  onJoin: () => void;
  disabled: boolean;
  loading: boolean;
}

export const TableJoinButton = ({ onJoin, disabled, loading }: TableJoinButtonProps) => {
  return (
    <Button
      className="w-full"
      onClick={onJoin}
      disabled={disabled}
    >
      {loading ? 'Joining...' : 'Join Table'}
    </Button>
  );
};
