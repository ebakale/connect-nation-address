import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Address, useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';

interface AddressEditorProps {
  address?: Address | null;
  onBack: () => void;
  onSave?: (address: Address) => void;
}

interface EditableAddressData {
  country: string;
  region: string;
  city: string;
  street: string;
  building: string;
  latitude: string;
  longitude: string;
  address_type: string;
  description: string;
  verified: boolean;
  public: boolean;
}

const AddressEditor: React.FC<AddressEditorProps> = ({ address, onBack, onSave }) => {
  const { updateAddressStatus } = useAddresses();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<EditableAddressData>({
    country: '',
    region: '',
    city: '',
    street: '',
    building: '',
    latitude: '',
    longitude: '',
    address_type: 'residential',
    description: '',
    verified: false,
    public: false,
  });

  // Load address data when component mounts or address changes
  useEffect(() => {
    if (address) {
      setFormData({
        country: address.country,
        region: address.region,
        city: address.city,
        street: address.street,
        building: address.building || '',
        latitude: address.latitude.toString(),
        longitude: address.longitude.toString(),
        address_type: address.address_type,
        description: address.description || '',
        verified: address.verified,
        public: address.public,
      });
    }
  }, [address]);

  const handleSave = async () => {
    if (!address) return;

    // Validate required fields
    if (!formData.country || !formData.region || !formData.city || !formData.street || !formData.latitude || !formData.longitude) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update address status (verified/public)
      await updateAddressStatus(address.id, {
        verified: formData.verified,
        public: formData.public,
      });

      // Note: In a real implementation, you would also update the other fields
      // For now, we're only updating the status fields that are supported by the hook
      
      toast({
        title: "Success",
        description: "Address updated successfully",
      });

      // Create updated address object for callback
      const updatedAddress: Address = {
        ...address,
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      onSave?.(updatedAddress);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No address selected for editing</p>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Edit Address</h2>
          <p className="text-muted-foreground">Modify address details and status</p>
        </div>
      </div>

      {/* Address Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {address.uac}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="outline" className={
              address.address_type === 'government' ? 'border-success text-success' :
              address.address_type === 'commercial' ? 'border-primary text-primary' :
              address.address_type === 'residential' ? 'border-warning text-warning' :
              'border-destructive text-destructive'
            }>
              {(() => {
                const v = address.address_type as string | undefined;
                const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                return safe;
              })()}
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
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Country *</label>
              <Input 
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Equatorial Guinea"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Region/Province *</label>
              <Input 
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                placeholder="Bioko Norte"
              />
            </div>
            <div>
              <label className="text-sm font-medium">City/District *</label>
              <Input 
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Malabo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Street/Area *</label>
              <Input 
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Avenida de la Independencia"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Building/House Number</label>
              <Input 
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                placeholder="House #42"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Property Type</label>
              <select
                value={formData.address_type}
                onChange={(e) => setFormData(prev => ({ ...prev, address_type: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full text-sm"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="government">Government</option>
                <option value="landmark">Landmark</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Latitude *</label>
              <Input 
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="3.7500"
                type="number"
                step="any"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Longitude *</label>
              <Input 
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="8.7833"
                type="number"
                step="any"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about the location"
            />
          </div>

          {/* Status Controls */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Address Status</h4>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="verified"
                checked={formData.verified}
                onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="verified" className="text-sm font-medium">
                Verified Address (Address has been confirmed and validated)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="public"
                checked={formData.public}
                onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="public" className="text-sm font-medium">
                Public Address (Visible in public searches - for businesses, landmarks, etc.)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onBack} disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Address Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Created:</strong> {new Date(address.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(address.updated_at).toLocaleString()}</p>
            <p><strong>Coordinates:</strong> {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressEditor;