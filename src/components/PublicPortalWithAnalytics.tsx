import React from 'react';
import { PublicAccessPortal } from './PublicAccessPortal';
import { SearchAnalyticsTracker } from './SearchAnalyticsTracker';
import { MobileUXEnhancements } from './MobileUXEnhancements';
import { OfflineIndicator } from './OfflineIndicator';

interface PublicPortalWithAnalyticsProps {
  onNavigateToEmergency?: (addressData?: any) => void;
}

export const PublicPortalWithAnalytics: React.FC<PublicPortalWithAnalyticsProps> = ({ 
  onNavigateToEmergency 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Mobile Status Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-2 max-w-md mx-auto">
          <div className="text-sm font-medium">ConnectNation Address</div>
          <OfflineIndicator />
        </div>
      </div>

      {/* Main Content */}
      <SearchAnalyticsTracker>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Portal */}
            <div className="lg:col-span-2">
              <PublicAccessPortal onNavigateToEmergency={onNavigateToEmergency} />
            </div>
            
            {/* Mobile Enhancements Sidebar */}
            <div className="lg:col-span-1">
              <MobileUXEnhancements />
            </div>
          </div>
        </div>
      </SearchAnalyticsTracker>
    </div>
  );
};