
import { useState, useEffect } from 'react';

/**
 * A hook that syncs state across browser tabs using localStorage
 * This will allow real-time updates to work across multiple browser tabs
 */
export function useSharedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Create a local state that will reflect the shared state
  const [state, setState] = useState<T>(() => {
    try {
      // Check if there's an existing value in localStorage
      const storedValue = localStorage.getItem(`shared_${key}`);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error retrieving state from localStorage for key ${key}:`, error);
      return initialValue;
    }
  });

  // Set up listener for storage events from other tabs
  useEffect(() => {
    // This function is called when localStorage changes in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `shared_${key}` && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          console.log(`Updating state for ${key} from storage event:`, newState);
          setState(newState);
        } catch (error) {
          console.error(`Error parsing shared state for ${key}:`, error);
        }
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
    try {
      // Update localStorage
      const valueToStore = JSON.stringify(value);
      localStorage.setItem(`shared_${key}`, valueToStore);
      
      // Also update local state
      setState(value);
      
      // Create and dispatch a custom event to notify the current tab
      const event = new StorageEvent('storage', {
        key: `shared_${key}`,
        newValue: valueToStore
      });
      window.dispatchEvent(event);
      
      console.log(`Updated shared state for ${key}:`, value);
    } catch (error) {
      console.error(`Error setting shared state for ${key}:`, error);
    }
  };

  return [state, setSharedState];
}
