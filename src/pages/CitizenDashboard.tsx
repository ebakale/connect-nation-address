import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, FileText, AlertCircle, Clock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { AddressRequestStatus } from "@/components/AddressRequestStatus";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const CitizenDashboard = () => {
  const { role, loading } = useUserRole();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [submitRequestOpen, setSubmitRequestOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If showing map view for selected address
  if (showMapView && selectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <AddressMapViewer 
            address={selectedAddress}
            onBack={() => {
              setShowMapView(false);
              setSelectedAddress(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Citizen Portal</h1>
          <p className="text-muted-foreground">Search verified addresses and submit requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Addresses
              </CardTitle>
              <CardDescription>
                Find verified addresses in the national database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Search Database
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search Verified Addresses</DialogTitle>
                    <DialogDescription>
                      Search for verified addresses in the national database
                    </DialogDescription>
                  </DialogHeader>
                  <AddressSearch 
                    onSelectAddress={(address) => {
                      console.log('Selected address:', address);
                      setSelectedAddress(address);
                      setSearchOpen(false);
                      setShowMapView(true);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submit Request
              </CardTitle>
              <CardDescription>
                Submit a new address registration request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setSubmitRequestOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Address Status
              </CardTitle>
              <CardDescription>
                Track the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setStatusOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Check Status
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• All address searches show verified addresses only</li>
              <li>• Personal information is protected and redacted</li>
              <li>• Coordinates are approximated for privacy</li>
              <li>• Submit requests for new address verification</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit Request Dialog */}
        <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Address Request</DialogTitle>
            </DialogHeader>
            <AddressRequestForm 
              onCancel={() => setSubmitRequestOpen(false)}
              onSuccess={() => setSubmitRequestOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Status Dialog */}
        <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Address Request Status</DialogTitle>
            </DialogHeader>
            <AddressRequestStatus />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CitizenDashboard;