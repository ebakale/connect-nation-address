import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { CARMetrics } from '@/hooks/useCARMetrics';

export function CARMetricsCards({ metrics }: { metrics: CARMetrics }) {
  const verificationRate = metrics.totalCitizenAddresses > 0
    ? Math.round((metrics.confirmedAddresses / metrics.totalCitizenAddresses) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Address Declarations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalCitizenAddresses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From {metrics.totalPersonRecords} person records</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingVerificationAddresses}</div>
          <p className="text-xs text-muted-foreground">{metrics.addressesRequiringReview} require manual review</p>
          {metrics.pendingVerificationAddresses > 50 && (
            <Badge variant="destructive" className="mt-2">High backlog</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verificationRate}%</div>
          <Progress value={verificationRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.confirmedAddresses} confirmed, {metrics.rejectedAddresses} rejected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageVerificationTimeHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">Average verification time</p>
          {metrics.duplicatePersonRecords > 0 && (
            <Badge variant="destructive" className="mt-2">
              {metrics.duplicatePersonRecords} duplicate persons
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
