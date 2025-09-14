import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Scan } from 'lucide-react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import AddressSearch from '@/components/AddressSearch';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

export const QRAddressDemo: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  const handleAddressSelect = (address: SearchResult) => {
    setSelectedAddress(address);
    toast({
      title: "Address Selected",
      description: `Selected: ${address.uac}`,
    });
  };

  const handleQRScan = (uac: string) => {
    toast({
      title: "QR Code Scanned",
      description: `Scanned UAC: ${uac}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Address System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Search Addresses */}
          <div className="space-y-2">
            <h3 className="font-semibold">Search Addresses</h3>
            <p className="text-sm text-muted-foreground">
              Search for addresses by text or scan QR codes
            </p>
            <AddressSearch onSelectAddress={handleAddressSelect} />
          </div>

          {/* Selected Address */}
          {selectedAddress && (
            <div className="space-y-2">
              <h3 className="font-semibold">Selected Address</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold">{selectedAddress.uac}</span>
                      <QRCodeGenerator 
                        uac={selectedAddress.uac}
                        addressText={selectedAddress.readable}
                        variant="icon"
                        size="md"
                      />
                    </div>
                    <p className="text-sm">{selectedAddress.readable}</p>
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {selectedAddress.coordinates.lat.toFixed(4)}, {selectedAddress.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feature Overview */}
          <div className="space-y-2">
            <h3 className="font-semibold">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-primary" />
                      <span className="font-medium">Generate QR Codes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create QR codes for any address to share with others
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-secondary" />
                      <span className="font-medium">Scan QR Codes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use camera to scan QR codes and navigate to addresses
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Use Cases */}
          <div className="space-y-2">
            <h3 className="font-semibold">Use Cases</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Delivery Services:</strong> Scan QR codes instead of typing long UACs</p>
              <p>• <strong>Emergency Response:</strong> Quick access to exact locations</p>
              <p>• <strong>Social Sharing:</strong> Share your address via QR code on business cards</p>
              <p>• <strong>Offline Access:</strong> Print QR codes for areas with poor connectivity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};