import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CitizenAddressVerificationManager } from '@/components/CitizenAddressVerificationManager';

interface Props {
  hasCARManagementAccess: boolean;
  onRefresh: () => void;
}

export function CARManagementTab({ hasCARManagementAccess, onRefresh }: Props) {
  if (!hasCARManagementAccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to manage person records.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <CitizenAddressVerificationManager onSuccess={onRefresh} />;
}
