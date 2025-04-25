
import { useState, useEffect } from 'react';

export const useAnnouncementDisplay = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  const displayAnnouncement = (text: string) => {
    setLastAnnouncement(text);
    setShowAnnouncement(true);

    const timer = setTimeout(() => {
      setShowAnnouncement(false);
    }, 10000);

    return () => clearTimeout(timer);
  };

  return {
    showAnnouncement,
    lastAnnouncement,
    setLastAnnouncement,
    setShowAnnouncement,
    displayAnnouncement
  };
};
