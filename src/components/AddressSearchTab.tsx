import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddressSearch from "./AddressSearch";
import DashboardLocationMap from "./DashboardLocationMap";

export function AddressSearchTab() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Search Addresses */}
          <Card className="shadow-card w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5" />
                Search Addresses
              </CardTitle>
              <CardDescription className="text-sm">
                Find verified addresses and view them on the map below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <AddressSearch 
                onSelectAddress={setSelectedAddress}
              />
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card className="shadow-card w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Search by UAC Code</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Enter the full UAC code (e.g., EG-BN-MAL-001-001)</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Search by Address</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Enter street name, building name, or landmark</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Search by City</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Enter city or district name</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Map and Points of Interest */}
          <Card className="shadow-card w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Nearby Map and Points of Interest
              </CardTitle>
              <CardDescription className="text-sm">
                Shows your current location, UAC within 20m, and nearby non-residential places
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="min-h-[400px] sm:min-h-[500px] w-full">
                <DashboardLocationMap 
                  searchedAddress={selectedAddress}
                  onAddressSearched={setSelectedAddress}
                />
              </div>
            </CardContent>
          </Card>

          {/* Map Features */}
          <Card className="shadow-card w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Map Features</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Current Location</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Your GPS location is shown with a blue marker</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Nearby Addresses</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Verified addresses within 20m radius</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Points of Interest</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">Schools, hospitals, government buildings, and businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Only visible on larger screens */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-card w-full sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Additional tools and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm mb-1">Recent Searches</p>
                  <p className="text-muted-foreground text-xs">Your recent address searches will appear here</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm mb-1">Saved Locations</p>
                  <p className="text-muted-foreground text-xs">Bookmark frequently accessed addresses</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm mb-1">Export Data</p>
                  <p className="text-muted-foreground text-xs">Download search results and location data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}