import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, X, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface QRCodeScannerProps {
  onScanResult: (uac: string) => void;
  variant?: 'icon' | 'button';
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  onScanResult, 
  variant = 'icon' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }
    
    return () => {
      if (qrScanner) {
        qrScanner.destroy();
      }
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      if (!videoRef.current) return;

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR code detected:', result.data);
          
          // Validate if the scanned content looks like a UAC
          if (isValidUAC(result.data)) {
            onScanResult(result.data.trim().toUpperCase());
            toast({
              title: "QR Code Scanned",
              description: `Found address: ${result.data}`,
            });
            setIsOpen(false);
          } else {
            toast({
              title: "Invalid QR Code",
              description: "This doesn't appear to be an address UAC",
              variant: "destructive",
            });
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scanner.start();
      setQrScanner(scanner);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setIsScanning(false);
  };

  const isValidUAC = (text: string): boolean => {
    // Basic UAC format validation: XX-XX-XXX-XXXXXX-XX
    const uacPattern = /^[A-Z]{2}-[A-Z]{2}-[A-Z]{3}-[A-Z0-9]{6}-[A-Z]{2}$/i;
    return uacPattern.test(text.trim());
  };

  const handleClose = () => {
    stopScanner();
    setIsOpen(false);
    setError('');
  };

  const TriggerButton = variant === 'icon' ? (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <QrCode className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <QrCode className="h-4 w-4 mr-2" />
      Scan QR Code
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open) {
        setIsOpen(true);
      } else {
        handleClose();
      }
    }}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Address QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error ? (
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button onClick={startScanner} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                      <ScanLine className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Point your camera at a QR code containing an address UAC
                </p>
                <p className="text-xs text-muted-foreground">
                  The scanner will automatically detect and process the code
                </p>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleClose} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};