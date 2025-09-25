import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';
import type { CARMetrics } from '@/hooks/useCARMetrics';

export function CARSystemStatus({ metrics }: { metrics: CARMetrics }) {
  const verificationRate = metrics.totalCitizenAddresses > 0
    ? Math.round((metrics.confirmedAddresses / metrics.totalCitizenAddresses) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Auto-Verification</span>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Data Quality</span>
          <Badge variant="outline" className={verificationRate > 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
            {verificationRate > 80 ? 'Good' : 'Needs Attention'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Processing Queue</span>
          <Badge variant="outline" className={metrics.pendingVerificationAddresses < 20 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
            {metrics.pendingVerificationAddresses < 20 ? 'Normal' : 'High Volume'}
          </Badge>
        </div>

        {metrics.duplicatePersonRecords > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Duplicate Records</span>
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {metrics.duplicatePersonRecords} found
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
