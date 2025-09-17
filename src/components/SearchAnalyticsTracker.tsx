import React from 'react';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';

interface SearchAnalyticsTrackerProps {
  children: React.ReactNode;
}

export const SearchAnalyticsTracker: React.FC<SearchAnalyticsTrackerProps> = ({ children }) => {
  const { trackSearch } = useSearchAnalytics();

  // Provide analytics tracking context to children
  const contextValue = {
    trackSearch,
  };

  return (
    <div data-analytics-tracker="true">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { analyticsTracker: contextValue } as any);
        }
        return child;
      })}
    </div>
  );
};