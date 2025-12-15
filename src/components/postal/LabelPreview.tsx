import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePostalLabels } from '@/hooks/usePostalLabels';
import { DeliveryOrder } from '@/types/postal';
import { Printer, Download, QrCode, Loader2 } from 'lucide-react';

interface LabelPreviewProps {
  open: boolean;
  onClose: () => void;
  order: DeliveryOrder;
}

export const LabelPreview = ({ open, onClose, order }: LabelPreviewProps) => {
  const { t } = useTranslation('postal');
  const { generateLabel, generateQRCode, loading } = usePostalLabels();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (open && order) {
      generateQRForOrder();
    }
  }, [open, order]);

  const generateQRForOrder = async () => {
    const trackingUrl = `${window.location.origin}/track?order=${order.order_number}`;
    const qrUrl = await generateQRCode(trackingUrl);
    setQrCodeUrl(qrUrl);
  };

  const handleGenerateLabel = async () => {
    const blob = await generateLabel(order);
    if (blob) {
      setPdfBlob(blob);
    }
  };

  const handlePrint = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');
      printWindow?.print();
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label-${order.order_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getPriorityLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: t('priority.urgent'),
      2: t('priority.high'),
      3: t('priority.normal'),
      4: t('priority.low'),
      5: t('priority.economy'),
    };
    return labels[level] || labels[3];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {t('labels.preview')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Label Preview */}
          <div className="border-2 border-dashed rounded-lg p-6 bg-white">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.from')}</p>
                  <p className="font-medium">{order.sender_name}</p>
                  {order.sender_phone && <p className="text-sm">{order.sender_phone}</p>}
                </div>
                <Badge variant={order.priority_level <= 2 ? 'destructive' : 'secondary'}>
                  {getPriorityLabel(order.priority_level)}
                </Badge>
              </div>

              {/* Recipient */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">{t('labels.to')}</p>
                <p className="text-lg font-bold">{order.recipient_name}</p>
                <p className="font-mono text-sm">{order.recipient_address_uac}</p>
                {order.recipient_phone && <p className="text-sm">{order.recipient_phone}</p>}
              </div>

              {/* QR Code and Details */}
              <div className="flex justify-between items-end border-t pt-4">
                <div className="space-y-1">
                  <p className="font-mono font-bold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`package.types.${order.package_type}`)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {order.requires_signature && (
                      <Badge variant="outline" className="text-xs">
                        {t('labels.signatureRequired')}
                      </Badge>
                    )}
                    {order.requires_id_verification && (
                      <Badge variant="outline" className="text-xs">
                        {t('labels.idRequired')}
                      </Badge>
                    )}
                  </div>
                </div>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 bg-muted animate-pulse rounded" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!pdfBlob ? (
              <Button onClick={handleGenerateLabel} disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                {t('labels.generate')}
              </Button>
            ) : (
              <>
                <Button onClick={handlePrint} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  {t('labels.print')}
                </Button>
                <Button variant="outline" onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  {t('labels.download')}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              {t('common:buttons.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
