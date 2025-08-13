import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import AddressSearch from '@/components/AddressSearch';
import AddressCard from '@/components/AddressCard';
import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Search as SearchIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading } = useAuth();

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
                      <Input placeholder="Equatorial Guinea" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Region/Province</label>
                      <Input placeholder="Bioko Norte" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City/District</label>
                      <Input placeholder="Malabo" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Street/Area</label>
                      <Input placeholder="Avenida de la Independencia" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Building/House Number</label>
                      <Input placeholder="House #42" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Property Type</label>
                      <Input placeholder="Residential" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Latitude</label>
                      <Input placeholder="3.7500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Longitude</label>
                      <Input placeholder="8.7833" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input placeholder="Additional details about the location" />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={() => {
                        // Generate a unique address code
                        const timestamp = Date.now().toString(36);
                        const random = Math.random().toString(36).substr(2, 5);
                        const uac = `EG-${timestamp}-${random}`.toUpperCase();
                        alert(`Address registered successfully!\nGenerated UAC: ${uac}`);
                      }}
                    >
                      Generate UAC & Register
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interactive Map</h2>
              <p className="text-muted-foreground">View and explore all registered addresses</p>
            </div>
            <MapView />
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
