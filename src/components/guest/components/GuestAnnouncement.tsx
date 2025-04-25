
import { BellRing } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GuestAnnouncementProps {
  text: string;
}

export const GuestAnnouncement = ({ text }: GuestAnnouncementProps) => {
  return (
    <div className="w-full max-w-xl mb-6 animate-fade-in">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start">
            <BellRing className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium">Announcement</h3>
              <p className="text-sm mt-1">{text}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
