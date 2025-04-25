
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'error';
  onRefresh: () => void;
}

export const ConnectionStatus = ({ status, onRefresh }: ConnectionStatusProps) => {
  if (status === 'connected') return null;

  return (
    <div className="w-full max-w-xl mb-6">
      <Card className={`border-l-4 ${
        status === 'connecting' ? 'border-l-amber-500' : 'border-l-red-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                status === 'connecting' ? 'bg-amber-600 animate-pulse' : 'bg-red-600'
              }`}></div>
              <div>
                <h3 className="font-medium">{
                  status === 'connecting' 
                    ? 'Connecting to realtime updates...' 
                    : 'Error connecting to realtime updates'
                }</h3>
                <p className="text-sm text-muted-foreground">{
                  status === 'connecting'
                    ? 'Please wait while we establish a connection.'
                    : 'Some features may not work properly.'
                }</p>
              </div>
            </div>
            {status === 'error' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
