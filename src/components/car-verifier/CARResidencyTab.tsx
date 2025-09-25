import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResidencyVerificationManager } from '@/components/ResidencyVerificationManager';

export function CARResidencyTab({ isResidencyVerifier }: { isResidencyVerifier: boolean }) {
  if (!isResidencyVerifier) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to verify residency requests.
          </p>
        </CardContent>
      </Card>
    );
  }
  return <ResidencyVerificationManager />;
}
