import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Download, Share } from 'lucide-react';
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
    if (isOpen && canvasRef.current && uac) {
      generateQRCode();
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

  const downloadQRCode = () => {
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

  const shareQRCode = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `address-qr-${uac}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Address QR Code - ${uac}`,
          text: addressText ? `Address: ${addressText}` : `Address UAC: ${uac}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
        // Fallback to copying UAC
        copyToClipboard();
      }
    } else {
      // Fallback to copying UAC
      copyToClipboard();
    }
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
      Generate QR Code
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
            Address QR Code
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
              Download
            </Button>
            <Button onClick={shareQRCode} variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Others can scan this QR code to navigate to this address
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};