import { AddressRequestApprovalPanel } from "./AddressRequestApprovalPanel";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface AddressVerificationQueueProps {
  onClose?: () => void;
}

export function AddressVerificationQueue({ onClose }: AddressVerificationQueueProps) {
  const { t } = useTranslation('address');
  
  return (
    <div className="space-y-4 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold break-words">{t('verificationQueue')}</h3>
          <p className="text-sm text-muted-foreground break-words">{t('reviewAndVerifyPending')}</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="self-start sm:self-center">
            <X className="h-4 w-4 mr-2" />
            {t('close')}
          </Button>
        )}
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <AddressRequestApprovalPanel />
      </div>
    </div>
  );
}