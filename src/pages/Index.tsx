import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import AddressSearch from '@/components/AddressSearch';
import AddressCard from '@/components/AddressCard';
import AddressList from '@/components/AddressList';
import AddressEditor from '@/components/AddressEditor';
import AddressViewer from '@/components/AddressViewer';
import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Search as SearchIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses, Address } from '@/hooks/useAddresses';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [mapAddress, setMapAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    city: '',
    street: '',
    building: '',
    latitude: '',
    longitude: '',
    address_type: 'residential',
    description: '',
    public: false
  });
  const { user, loading } = useAuth();
  const { createAddress, addresses, loading: addressLoading } = useAddresses();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Sample address data
  const sampleAddress = {
    uac: "EG-BA-MB-004512",
    country: "Equatorial Guinea",
    region: "Bioko Norte",
    city: "Malabo", 
    street: "Avenida de la Independencia",
    building: "House #42",
    coordinates: { lat: 3.7500, lng: 8.7833 },
    metadata: {
      type: "Residential",
      description: "2-story building, near Shell Fuel Station",
      verified: true
    }
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setEditMode(true);
    setCurrentPage('manage');
  };

  const handleViewAddress = (address: Address) => {
    setSelectedAddress(address);
    setEditMode(false);
    setCurrentPage('manage');
  };

  const handleBackToList = () => {
    setSelectedAddress(null);
    setEditMode(false);
    setCurrentPage('manage');
  };

  const handleViewOnMap = (address: Address) => {
    setMapAddress(address);
    setCurrentPage('map');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Address Search</h2>
              <p className="text-muted-foreground">Find and verify existing addresses in the system</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <AddressSearch 
                  onSelectAddress={(result) => {
                    console.log('Selected address:', result);
                  }}
                />
              </div>
              <div className="lg:w-96">
                <AddressCard 
                  address={sampleAddress}
                  onViewMap={() => setCurrentPage('map')}
                />
              </div>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Add New Address</h2>
              <p className="text-muted-foreground">Register a new location in the system</p>
            </div>
            
            <div className="max-w-2xl">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Address Registration Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Country</label>
                      <Input 
                        placeholder="Equatorial Guinea" 
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Region/Province</label>
                      <Input 
                        placeholder="Bioko Norte" 
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City/District</label>
                      <Input 
                        placeholder="Malabo" 
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Street/Area</label>
                      <Input 
                        placeholder="Avenida de la Independencia" 
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Building/House Number</label>
                      <Input 
                        placeholder="House #42" 
                        value={formData.building}
                        onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Property Type</label>
                      <Input 
                        placeholder="residential" 
                        value={formData.address_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_type: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Latitude</label>
                      <Input 
                        placeholder="3.7500" 
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Longitude</label>
                      <Input 
                        placeholder="8.7833" 
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input 
                      placeholder="Additional details about the location" 
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="publicAddress"
                      checked={formData.public}
                      onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="publicAddress" className="text-sm font-medium">
                      Make this address publicly visible (for businesses, landmarks, etc.)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      disabled={addressLoading}
                      onClick={async () => {
                        // Validate required fields
                        if (!formData.country || !formData.region || !formData.city || !formData.street || !formData.latitude || !formData.longitude) {
                          alert('Please fill in all required fields (Country, Region, City, Street, Latitude, Longitude)');
                          return;
                        }

                        // Create address in database
                        const result = await createAddress({
                          country: formData.country,
                          region: formData.region,
                          city: formData.city,
                          street: formData.street,
                          building: formData.building || undefined,
                          latitude: parseFloat(formData.latitude),
                          longitude: parseFloat(formData.longitude),
                          address_type: formData.address_type || 'residential',
                          description: formData.description || undefined,
                          public: formData.public,
                        });

                        if (result) {
                          // Clear form after successful creation
                          setFormData({
                            country: '',
                            region: '',
                            city: '',
                            street: '',
                            building: '',
                            latitude: '',
                            longitude: '',
                            address_type: 'residential',
                            description: '',
                            public: false
                          });
                        }
                      }}
                    >
                      {addressLoading ? 'Creating...' : 'Generate UAC & Register'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Save form data as draft
                        const formData = {
                          country: "Draft saved",
                          timestamp: new Date().toLocaleString()
                        };
                        localStorage.setItem('addressDraft', JSON.stringify(formData));
                        alert('Draft saved successfully!');
                      }}
                    >
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'map':
        const mapLocations = mapAddress ? [{
          uac: mapAddress.uac,
          coordinates: [mapAddress.longitude, mapAddress.latitude] as [number, number],
          name: `${mapAddress.street}${mapAddress.building ? ', ' + mapAddress.building : ''}`,
          type: mapAddress.address_type as 'residential' | 'commercial' | 'landmark' | 'government',
          verified: mapAddress.verified
        }] : addresses.map(addr => ({
          uac: addr.uac,
          coordinates: [addr.longitude, addr.latitude] as [number, number],
          name: `${addr.street}${addr.building ? ', ' + addr.building : ''}`,
          type: addr.address_type as 'residential' | 'commercial' | 'landmark' | 'government',
          verified: addr.verified
        }));
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Interactive Map</h2>
                <p className="text-muted-foreground">
                  {mapAddress 
                    ? `Showing location: ${mapAddress.uac}` 
                    : 'View and explore all registered addresses'
                  }
                </p>
              </div>
              {mapAddress && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMapAddress(null);
                    setCurrentPage('manage');
                  }}
                >
                  Back to List
                </Button>
              )}
            </div>
            <MapView 
              locations={mapLocations}
              center={mapAddress ? [mapAddress.longitude, mapAddress.latitude] : undefined}
              zoom={mapAddress ? 16 : 12}
              onLocationSelect={(location) => {
                const address = addresses.find(addr => addr.uac === location.uac);
                if (address) {
                  handleViewAddress(address);
                }
              }}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">System Analytics</h2>
              <p className="text-muted-foreground">Coverage statistics and usage metrics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Urban Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success mb-2">92.5%</div>
                  <p className="text-sm text-muted-foreground">Major cities mapped</p>
                  <Badge variant="outline" className="mt-2 border-success text-success">On Track</Badge>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Rural Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning mb-2">64.8%</div>
                  <p className="text-sm text-muted-foreground">Rural areas mapped</p>
                  <Badge variant="outline" className="mt-2 border-warning text-warning">In Progress</Badge>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">15.2K</div>
                  <p className="text-sm text-muted-foreground">Requests today</p>
                  <Badge variant="outline" className="mt-2">Active</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'manage':
        if (selectedAddress && editMode) {
          return (
            <AddressEditor
              address={selectedAddress}
              onBack={handleBackToList}
              onSave={(updatedAddress) => {
                console.log('Address updated:', updatedAddress);
                handleBackToList();
              }}
            />
          );
        } else if (selectedAddress && !editMode) {
          return (
            <AddressViewer
              address={selectedAddress}
              onBack={handleBackToList}
              onEdit={handleEditAddress}
            />
          );
        } else {
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Address Management</h2>
                <p className="text-muted-foreground">View and manage all registered addresses</p>
              </div>
              <AddressList
                onEditAddress={handleEditAddress}
                onViewAddress={handleViewAddress}
                onViewOnMap={handleViewOnMap}
              />
            </div>
          );
        }

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">System Settings</h2>
              <p className="text-muted-foreground">Configure system parameters and access controls</p>
            </div>
            
            <Card className="shadow-card max-w-2xl">
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>API Access</span>
                  <Badge variant="outline" className="border-success text-success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Public Search</span>
                  <Badge variant="outline" className="border-success text-success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bulk Operations</span>
                  <Badge variant="outline">Admin Only</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
