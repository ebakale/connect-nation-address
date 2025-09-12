import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Copy, 
  CheckCircle, 
  XCircle,
  Globe,
  Lock,
  Calendar,
  Tag,
  Building,
  MapPin as LocationIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: {
    uac: string;
    street: string;
    building?: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    address_type: string;
    verified: boolean;
    public: boolean;
    description?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

const AddressDetailModal: React.FC<AddressDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  address 
}) => {
  const { toast } = useToast();

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
      case 'government': return 'border-green-500 text-green-700 bg-green-50';
      case 'commercial': return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'residential': return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'landmark': return 'border-red-500 text-red-700 bg-red-50';
      default: return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  if (!address) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-mono text-xl">{address.uac}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getTypeColor(address.address_type)}>
              <Tag className="h-3 w-3 mr-1" />
              {(() => {
                const v = address.address_type as string | undefined;
                const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                return safe;
              })()}
            </Badge>
            
            {address.verified ? (
              <Badge variant="outline" className="border-green-500 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                <XCircle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}

            {address.public ? (
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Location
                </h4>
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
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <LocationIcon className="h-4 w-4" />
                  Coordinates
                </h4>
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
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Record Information
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Created: {new Date(address.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(address.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
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
              variant="default" 
              onClick={getDirections}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDetailModal;