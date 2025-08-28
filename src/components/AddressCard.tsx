import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, QrCode, Copy, ExternalLink, Check, Navigation } from 'lucide-react';
import QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const addressData = {
          uac: address.uac,
          coordinates: address.coordinates,
          readable: `${address.street}, ${address.city}, ${address.region}, ${address.country}`
        };
        const qrUrl = await QRCode.toDataURL(JSON.stringify(addressData), {
          width: 128,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [address]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;
  };

  const getDirections = () => {
    const { lat, lng } = address.coordinates;
    const addressString = `${address.street}, ${address.city}, ${address.region}, ${address.country}`;
    
    // Detect user's device/browser and open appropriate map app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let url;
    
    if (isIOS) {
      // iOS: Try Apple Maps first, fallback to Google Maps
      url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
      
      // Fallback to Google Maps if Apple Maps fails
      setTimeout(() => {
        window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
      }, 25);
    } else if (isAndroid) {
      // Android: Use Google Maps intent
      url = `intent://navigate?q=${lat},${lng}#Intent;scheme=google.navigation;package=com.google.android.apps.maps;end`;
      
      // Fallback to web version
      setTimeout(() => {
        window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
      }, 25);
    } else {
      // Desktop: Open Google Maps in new tab
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
            Digital Address
          </CardTitle>
          <Badge 
            variant={address.metadata.verified ? "default" : "secondary"}
            className={address.metadata.verified ? "bg-success text-success-foreground" : ""}
          >
            {address.metadata.verified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* UAC Code */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Address Code</p>
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
          <p className="text-sm font-medium text-muted-foreground">Readable Address</p>
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
          <p className="text-sm font-medium text-muted-foreground">Property Details</p>
          <div className="flex gap-2">
            <Badge variant="outline">{address.metadata.type}</Badge>
          </div>
          {address.metadata.description && (
            <p className="text-sm text-muted-foreground">{address.metadata.description}</p>
          )}
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-lg border">
              <img src={qrCodeUrl} alt="Address QR Code" className="w-24 h-24" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" onClick={onViewMap} className="flex-1">
            <ExternalLink className="h-4 w-4" />
            View on Map
          </Button>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={getDirections}
            className="flex-1"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(qrCodeUrl)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;