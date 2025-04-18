
import { useState, useEffect } from 'react';

/**
 * A hook that syncs state across browser tabs using localStorage
 * This will allow real-time updates to work across multiple browser tabs
 */
export function useSharedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Create a local state that will reflect the shared state
  const [state, setState] = useState<T>(() => {
    // Check if there's an existing value in localStorage
    const storedValue = localStorage.getItem(`shared_${key}`);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  // Set up listener for storage events from other tabs
  useEffect(() => {
    // This function is called when localStorage changes in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `shared_${key}` && event.newValue) {
        setState(JSON.parse(event.newValue));
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  // Function to update the shared state
  const setSharedState = (value: T) => {
    // Update localStorage
    localStorage.setItem(`shared_${key}`, JSON.stringify(value));
    // Also update local state
    setState(value);
    // Dispatch a custom event to notify the current tab
    window.dispatchEvent(new StorageEvent('storage', {
      key: `shared_${key}`,
      newValue: JSON.stringify(value)
    }));
  };

  return [state, setSharedState];
}
