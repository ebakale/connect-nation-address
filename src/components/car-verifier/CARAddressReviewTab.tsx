import React from 'react';
import { CARVerificationWorkflow } from '@/components/CARVerificationWorkflow';

export function CARAddressReviewTab({ onRefresh }: { onRefresh: () => void }) {
  return <CARVerificationWorkflow onUpdate={onRefresh} />;
}
