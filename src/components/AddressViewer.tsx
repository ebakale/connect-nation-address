import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Edit, 
  Navigation, 
  Copy, 
  CheckCircle, 
  XCircle,
  Globe,
  Lock,
  Calendar,
  Tag
} from 'lucide-react';
import { Address } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AddressViewerProps {
  address?: Address | null;
  onBack: () => void;
  onEdit?: (address: Address) => void;
}

const AddressViewer: React.FC<AddressViewerProps> = ({ address, onBack, onEdit }) => {
  const { toast } = useToast();
  const { t } = useTranslation('addresses');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const getDirections = () => {
    if (!address) return;
    
    const { latitude: lat, longitude: lng } = address;
    const addressString = `${address.street}, ${address.city}, ${address.region}, ${address.country}`;
    
    // Detect user's device/browser and open appropriate map app
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'border-success text-success bg-success/10';
      case 'commercial': return 'border-primary text-primary bg-primary/10';
      case 'residential': return 'border-warning text-warning bg-warning/10';
      case 'landmark': return 'border-destructive text-destructive bg-destructive/10';
      default: return 'border-muted text-muted-foreground bg-muted/10';
    }
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t('noAddressSelectedViewing')}</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        <div>
          <h2 className="text-2xl font-bold">{t('addressDetails')}</h2>
          <p className="text-muted-foreground">{t('viewCompleteAddress')}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit?.(address)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="default" onClick={getDirections}>
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
        </div>
      </div>

      {/* Main Address Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              <span className="font-mono text-2xl">{address.uac}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(address.uac, 'UAC')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getTypeColor(address.address_type)}>
              <Tag className="h-3 w-3 mr-1" />
              {address.address_type}
            </Badge>
            
            {address.verified ? (
              <Badge variant="outline" className="border-success text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="border-warning text-warning">
                <XCircle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}

            {address.public ? (
              <Badge variant="outline" className="border-primary text-primary">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                {t('private')}
              </Badge>
            )}
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Street:</strong> {address.street}</p>
                  {address.building && <p><strong>Building:</strong> {address.building}</p>}
                  <p><strong>City:</strong> {address.city}</p>
                  <p><strong>Region:</strong> {address.region}</p>
                  <p><strong>Country:</strong> {address.country}</p>
                </div>
              </div>

              {address.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {address.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Coordinates</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span><strong>Latitude:</strong> {address.latitude.toFixed(6)}°</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address.latitude.toString(), 'Latitude')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><strong>Longitude:</strong> {address.longitude.toFixed(6)}°</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address.longitude.toString(), 'Longitude')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${address.latitude}, ${address.longitude}`, 'Coordinates')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Record Information</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {new Date(address.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {new Date(address.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(address.uac, 'UAC')}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy UAC
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(`${address.latitude}, ${address.longitude}`, 'Coordinates')}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Coordinates
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const fullAddress = `${address.street}${address.building ? ', ' + address.building : ''}, ${address.city}, ${address.region}, ${address.country}`;
                copyToClipboard(fullAddress, 'Full Address');
              }}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Address
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressViewer;