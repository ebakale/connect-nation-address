import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddressSearch from "./AddressSearch";
import DashboardLocationMap from "./DashboardLocationMap";

export function AddressSearchTab() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Search Addresses */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Addresses
              </CardTitle>
              <CardDescription>
                Find verified addresses and view them on the map below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressSearch 
                onSelectAddress={setSelectedAddress}
              />
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Search Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Search by UAC Code</p>
                  <p className="text-muted-foreground text-xs">Enter the full UAC code (e.g., EG-BN-MAL-001-001)</p>
                </div>
                <div>
                  <p className="font-medium">Search by Address</p>
                  <p className="text-muted-foreground text-xs">Enter street name, building name, or landmark</p>
                </div>
                <div>
                  <p className="font-medium">Search by City</p>
                  <p className="text-muted-foreground text-xs">Enter city or district name</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Map and Points of Interest */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nearby Map and Points of Interest
              </CardTitle>
              <CardDescription>
                Shows your current location, UAC within 20m, and nearby non-residential places
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DashboardLocationMap 
                searchedAddress={selectedAddress}
                onAddressSearched={setSelectedAddress}
              />
            </CardContent>
          </Card>

          {/* Map Features */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Map Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Current Location</p>
                  <p className="text-muted-foreground text-xs">Your GPS location is shown with a blue marker</p>
                </div>
                <div>
                  <p className="font-medium">Nearby Addresses</p>
                  <p className="text-muted-foreground text-xs">Verified addresses within 20m radius</p>
                </div>
                <div>
                  <p className="font-medium">Points of Interest</p>
                  <p className="text-muted-foreground text-xs">Schools, hospitals, government buildings, and businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
        </div>
      </div>
    </div>
  );
}