import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Settings, UserCheck, Users, Layers } from 'lucide-react';
import { CARSystemStatus } from './CARSystemStatus';
import type { CARMetrics } from '@/hooks/useCARMetrics';

interface Props {
  metrics: CARMetrics;
  isResidencyVerifier: boolean;
  hasCARManagementAccess: boolean;
  onNavigate: (tab: string) => void;
}

export function CAROverview({ metrics, isResidencyVerifier, hasCARManagementAccess, onNavigate }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => onNavigate('verification')} className="w-full justify-start" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Review Address Declarations ({metrics.addressesRequiringReview})
          </Button>

          {isResidencyVerifier && (
            <Button onClick={() => onNavigate('residency')} className="w-full justify-start" variant="outline">
              <UserCheck className="h-4 w-4 mr-2" />
              Process Residency Verifications
            </Button>
          )}

          <Button onClick={() => onNavigate('quality')} className="w-full justify-start" variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Quality Dashboard
          </Button>

          {hasCARManagementAccess && (
            <Button onClick={() => onNavigate('management')} className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Addresses
            </Button>
          )}

          <Button onClick={() => onNavigate('unified')} className="w-full justify-start" variant="outline">
            <Layers className="h-4 w-4 mr-2" />
            Open Unified Address Dashboard
          </Button>
        </CardContent>
      </Card>

      <CARSystemStatus metrics={metrics} />
    </div>
  );
}
