import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, QrCode, Copy, ExternalLink, Check, Navigation, Printer } from 'lucide-react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useTranslation } from 'react-i18next';
import QRCodeLib from 'qrcode';
import coatOfArms from '@/assets/equatorial-guinea-coat-of-arms.png';

interface AddressData {
  uac: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  metadata: {
    type: string;
    description: string;
    verified: boolean;
  };
}

interface AddressCardProps {
  address: AddressData;
  onViewMap?: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onViewMap }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const { t } = useTranslation('common');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCodeLib.toDataURL(address.uac, { width: 200, margin: 2 })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
  }, [address.uac]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Address - ${address.uac}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .address-plate {
              background: #1e3a8a;
              color: white;
              padding: 40px 60px;
              border-radius: 8px;
              width: 600px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            }
            .coat-of-arms {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              flex: 1;
              line-height: 1.4;
            }
            .content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 30px;
            }
            .uac-section {
              background: rgba(255, 255, 255, 0.15);
              padding: 30px 40px;
              border-radius: 8px;
              text-align: center;
              width: 100%;
            }
            .uac-label {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 12px;
              font-weight: 500;
            }
            .uac-code {
              font-size: 42px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              letter-spacing: 3px;
            }
            .qr-section {
              text-align: center;
            }
            .qr-code {
              background: white;
              padding: 20px;
              border-radius: 8px;
              display: inline-block;
            }
            .qr-code img {
              display: block;
              width: 200px;
              height: 200px;
            }
          </style>
        </head>
        <body>
          <div class="address-plate">
            <div class="header">
              <img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms" />
              <div class="title">REPÚBLICA DE GUINEA ECUATORIAL<br/>DIRECCIÓN NACIONAL DE DIRECCIONES</div>
              <img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms" />
            </div>
            <div class="content">
              <div class="uac-section">
                <div class="uac-label">Código Único de Dirección</div>
                <div class="uac-code">${address.uac}</div>
              </div>
              <div class="qr-section">
                <div class="qr-code">
                  <img src="${qrCodeDataUrl}" alt="QR Code" />
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getDirections = () => {
    const { lat, lng } = address.coordinates;
    const addressString = `${address.street}, ${address.city}, ${address.region}, ${address.country}`;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let url;
    
    if (isIOS) {
      url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
      setTimeout(() => {
        window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
      }, 25);
    } else if (isAndroid) {
      url = `intent://navigate?q=${lat},${lng}#Intent;scheme=google.navigation;package=com.google.android.apps.maps;end`;
      setTimeout(() => {
        window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
      }, 25);
    } else {
      url = `https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {t('digitalAddress')}
          </CardTitle>
          <Badge 
            variant={address.metadata.verified ? "default" : "secondary"}
            className={address.metadata.verified ? "bg-success text-success-foreground" : ""}
          >
            {address.metadata.verified ? t('verified') : t('pending')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* UAC Code */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('uniqueAddressCode')}</p>
              <p className="text-lg font-mono font-bold text-primary">{address.uac}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(address.uac)}
              className="h-8 w-8 p-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Readable Address */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t('readableAddress')}</p>
          <div className="space-y-1">
            <p className="font-semibold">{address.country}</p>
            <p className="text-sm">{address.region}</p>
            <p className="text-sm">{address.city}</p>
            <p className="text-sm">{address.street}, {address.building}</p>
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-mono">
            {formatCoordinates(address.coordinates.lat, address.coordinates.lng)}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t('propertyDetails')}</p>
          <div className="flex gap-2">
            <Badge variant="outline">{address.metadata.type}</Badge>
          </div>
          {address.metadata.description && (
            <p className="text-sm text-muted-foreground">{address.metadata.description}</p>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t('qrCode')}</p>
          <div className="flex justify-center">
            <QRCodeGenerator 
              uac={address.uac}
              addressText={`${address.street}, ${address.city}, ${address.region}, ${address.country}`}
              variant="button"
              size="sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" onClick={onViewMap} className="flex-1 min-w-[120px]">
            <ExternalLink className="h-4 w-4" />
            {t('viewOnMap')}
          </Button>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={getDirections}
            className="flex-1 min-w-[120px]"
          >
            <Navigation className="h-4 w-4" />
            {t('directions')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="flex-1 min-w-[100px]"
          >
            <Printer className="h-4 w-4" />
            {t('print')}
          </Button>
          <QRCodeGenerator 
            uac={address.uac}
            addressText={`${address.street}, ${address.city}, ${address.region}, ${address.country}`}
            variant="icon"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;