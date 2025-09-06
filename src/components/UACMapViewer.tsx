import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UACAddressMap } from './UAC-AddressMap';
import { MapPin, Eye, EyeOff } from 'lucide-react';

export const UACMapViewer: React.FC = () => {
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [filterByRegion, setFilterByRegion] = useState<string>('');
  const [filterByCity, setFilterByCity] = useState<string>('');
  const [showMap, setShowMap] = useState(true);

  const regions = [
    'Bioko Norte',
    'Bioko Sur', 
    'Litoral',
    'Kié-Ntem',
    'Centro Sur',
    'Wele-Nzas',
    'Annobón',
    'Djibloho'
  ];

  const cities = [
    'Malabo',
    'Bata',
    'Ebebiyín',
    'Mongomo',
    'Evinayong',
    'Aconibe'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Map with UAC Display
          </CardTitle>
          <CardDescription>
            View all addresses in your system with their UAC codes and descriptions displayed on Google Maps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="public-only"
                checked={showOnlyPublic}
                onCheckedChange={setShowOnlyPublic}
              />
              <Label htmlFor="public-only">Show only public addresses</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="region-filter">Filter by region:</Label>
              <Select value={filterByRegion} onValueChange={setFilterByRegion}>
                <SelectTrigger id="region-filter" className="w-48">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="city-filter">Filter by city:</Label>
              <Select value={filterByCity} onValueChange={setFilterByCity}>
                <SelectTrigger id="city-filter" className="w-48">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              {showMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>

          {/* Map Display */}
          {showMap && (
            <div className="border rounded-lg overflow-hidden">
              <UACAddressMap
                showOnlyPublic={showOnlyPublic}
                filterByRegion={filterByRegion || undefined}
                filterByCity={filterByCity || undefined}
                allowResize={true}
              />
            </div>
          )}

          {/* Legend */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Map Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span>Residential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span>Commercial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span>Government</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                <span>Landmark</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                <span>Unverified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-green-600"></div>
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-blue-600"></div>
                <span>Public</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-gray-600"></div>
                <span>Private</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Click on any marker to see the full UAC code and address description</li>
              <li>• Different colors represent different address types (residential, commercial, etc.)</li>
              <li>• Use the filters to show only specific regions, cities, or public addresses</li>
              <li>• Click "Open in Google Maps" in the info window to navigate to that location</li>
              <li>• Use satellite/map toggle to switch between map views</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};