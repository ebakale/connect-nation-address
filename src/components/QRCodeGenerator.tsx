import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Download, Share, Mail, MessageCircle, Copy, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface QRCodeGeneratorProps {
  uac: string;
  addressText?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  uac, 
  addressText, 
  variant = 'icon',
  size = 'md' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('common');

  const qrSize = size === 'sm' ? 200 : size === 'md' ? 300 : 400;

  useEffect(() => {
    if (isOpen && uac) {
      // Add a small delay to ensure canvas is rendered
      setTimeout(() => {
        generateQRCode();
      }, 100);
    }
  }, [isOpen, uac]);

  const generateQRCode = async () => {
    try {
      if (!canvasRef.current) return;
      
      // Generate QR code with UAC
      await QRCode.toCanvas(canvasRef.current, uac, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(uac, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = async () => {
    if (!qrDataUrl) {
      await generateQRCode();
    }
    
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `address-qr-${uac}.png`;
    link.href = qrDataUrl;
    link.click();
    
    toast({
      title: "Downloaded",
      description: "QR code saved to your device",
    });
  };

  const shareViaEmail = async () => {
    if (!qrDataUrl) {
      await generateQRCode();
    }
    
    const subject = encodeURIComponent(`Address QR Code - ${uac}`);
    const body = encodeURIComponent(
      `Here's the address QR code:\n\nUAC: ${uac}\n${addressText ? `Address: ${addressText}\n` : ''}\nQR Code Image: ${qrDataUrl}\n\nScan this QR code to navigate to the address.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const downloadAndShare = async () => {
    if (!qrDataUrl) {
      await generateQRCode();
    }
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.download = `address-qr-${uac}.png`;
    link.href = qrDataUrl;
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: "Image saved to your device. You can now share it from your files.",
    });
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Address QR Code - UAC: ${uac}\n${addressText ? `Address: ${addressText}\n` : ''}\nI'm sharing a QR code for this address. Please save the image that was sent separately and scan it to navigate.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    
    // Also trigger download so user can manually attach the image
    downloadAndShare();
  };

  const copyShareText = () => {
    const shareText = `Address QR Code - UAC: ${uac}\n${addressText ? `Address: ${addressText}\n` : ''}Scan the QR code to navigate to this address.`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Copied",
        description: "Address information copied to clipboard",
      });
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uac).then(() => {
      toast({
        title: "Copied",
        description: "UAC copied to clipboard",
      });
    });
  };

  const TriggerButton = variant === 'icon' ? (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <QrCode className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <QrCode className="h-4 w-4 mr-2" />
      {t('generateQRCode')}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {t('addressQRCode')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">UAC: {uac}</p>
                {addressText && (
                  <p className="text-xs text-muted-foreground">{addressText}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={downloadQRCode} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('download')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  {t('share')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem onClick={shareViaEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  {t('emailWithImage')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareViaWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('whatsAppDownloadsImage')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAndShare}>
                  <FileImage className="h-4 w-4 mr-2" />
                  {t('saveShareImage')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyShareText}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('copyAddressText')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t('othersCanScanQRCode')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};