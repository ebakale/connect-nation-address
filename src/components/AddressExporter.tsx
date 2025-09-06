import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, ExternalLink, MapPin, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  uac: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  description?: string;
  address_type: string;
  verified: boolean;
  public: boolean;
}

export const AddressExporter: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [includePrivate, setIncludePrivate] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uacFilter, setUacFilter] = useState('');
  const { toast } = useToast();

  const fetchAddresses = async (): Promise<Address[]> => {
    let query = supabase.from('addresses').select('*');
    
    // Filter by UAC if specified
    if (uacFilter.trim()) {
      query = query.ilike('uac', `%${uacFilter.trim()}%`);
    }
    
    if (!includePrivate) {
      query = query.eq('public', true);
    }
    
    if (verifiedOnly) {
      query = query.eq('verified', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  const exportAsCSV = (addresses: Address[]) => {
    const headers = [
      'UAC',
      'Name',
      'Address',
      'Latitude',
      'Longitude',
      'Description',
      'Type',
      'City',
      'Region',
      'Country'
    ];
    
    const rows = addresses.map(addr => [
      addr.uac,
      addr.building || addr.street,
      `${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}`,
      addr.latitude.toString(),
      addr.longitude.toString(),
      addr.description || '',
      addr.address_type,
      addr.city,
      addr.region,
      addr.country
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `addresses_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportAsKML = (addresses: Address[]) => {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Address Export</name>
    <description>Exported addresses from UAC system</description>`;
    
    const placemarks = addresses.map(addr => `
    <Placemark>
      <name>${addr.uac} - ${addr.building || addr.street}</name>
      <description><![CDATA[
        <strong>UAC:</strong> ${addr.uac}<br/>
        <strong>Address:</strong> ${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}<br/>
        <strong>Type:</strong> ${addr.address_type}<br/>
        ${addr.description ? '<strong>Description:</strong> ' + addr.description + '<br/>' : ''}
        <strong>Status:</strong> ${addr.verified ? 'Verified' : 'Unverified'} | ${addr.public ? 'Public' : 'Private'}
      ]]></description>
      <Point>
        <coordinates>${addr.longitude},${addr.latitude},0</coordinates>
      </Point>
    </Placemark>`).join('');
    
    const kmlFooter = `
  </Document>
</kml>`;
    
    const kmlContent = kmlHeader + placemarks + kmlFooter;
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `addresses_export_${new Date().toISOString().split('T')[0]}.kml`;
    link.click();
  };

  const exportAsJSON = (addresses: Address[]) => {
    const exportData = {
      export_date: new Date().toISOString(),
      total_addresses: addresses.length,
      addresses: addresses.map(addr => ({
        uac: addr.uac,
        name: addr.building || addr.street,
        address: `${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}, ${addr.country}`,
        coordinates: {
          latitude: addr.latitude,
          longitude: addr.longitude
        },
        description: addr.description,
        type: addr.address_type,
        verified: addr.verified,
        public: addr.public,
        google_maps_url: `https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `addresses_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const openInGoogleMyMaps = async () => {
    try {
      setLoading(true);
      const addresses = await fetchAddresses();
      
      if (addresses.length === 0) {
        toast({
          title: "No addresses found",
          description: "No addresses match your current filter criteria.",
          variant: "destructive"
        });
        return;
      }

      // Create a simple CSV for Google My Maps import
      const headers = ['Name', 'Description', 'Latitude', 'Longitude'];
      const rows = addresses.map(addr => [
        `${addr.uac} - ${addr.building || addr.street}`,
        `${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}. Type: ${addr.address_type}${addr.description ? '. ' + addr.description : ''}`,
        addr.latitude.toString(),
        addr.longitude.toString()
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `google_my_maps_import_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      // Open Google My Maps
      setTimeout(() => {
        window.open('https://www.google.com/maps/d/', '_blank');
      }, 1000);
      
      toast({
        title: "Export created",
        description: "CSV file downloaded. Upload it to Google My Maps to view your addresses.",
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export addresses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const addresses = await fetchAddresses();
      
      if (addresses.length === 0) {
        toast({
          title: "No addresses found",
          description: "No addresses match your current filter criteria.",
          variant: "destructive"
        });
        return;
      }

      switch (exportFormat) {
        case 'csv':
          exportAsCSV(addresses);
          break;
        case 'kml':
          exportAsKML(addresses);
          break;
        case 'json':
          exportAsJSON(addresses);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `Exported ${addresses.length} addresses as ${exportFormat.toUpperCase()}.`,
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export addresses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Addresses
        </CardTitle>
        <CardDescription>
          Export your addresses in various formats compatible with Google Maps and other mapping services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="uac-filter">Filter by UAC (optional)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="uac-filter"
                type="text"
                placeholder="Enter UAC (e.g., GQ-BN-MAL-8A103R-UK)"
                value={uacFilter}
                onChange={(e) => setUacFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="kml">KML (Google Earth)</SelectItem>
                <SelectItem value="json">JSON (Developers)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="verified-only"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
              <Label htmlFor="verified-only">Verified addresses only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="include-private"
                checked={includePrivate}
                onCheckedChange={setIncludePrivate}
              />
              <Label htmlFor="include-private">Include private addresses</Label>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button onClick={handleExport} disabled={loading} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
          
          <Button variant="outline" onClick={openInGoogleMyMaps} disabled={loading} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export to Google My Maps
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>CSV:</strong> Import into Google My Maps, Excel, or other spreadsheet applications</p>
          <p><strong>KML:</strong> View in Google Earth or import into mapping applications</p>
          <p><strong>JSON:</strong> Use for developers or API integrations</p>
        </div>
      </CardContent>
    </Card>
  );
};