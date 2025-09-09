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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('address');

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
      t('uacLabel'),
      t('nameLabel'),
      t('addressLabel'),
      t('latitudeLabel'),
      t('longitudeLabel'),
      t('descriptionLabel'),
      t('typeLabel'),
      t('cityLabel'),
      t('regionLabel'),
      t('countryLabel')
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
    <name>${t('addressExport')}</name>
    <description>${t('exportedAddressesDescription')}</description>`;
    
    const placemarks = addresses.map(addr => `
    <Placemark>
      <name>${addr.uac} - ${addr.building || addr.street}</name>
      <description><![CDATA[
        <strong>UAC:</strong> ${addr.uac}<br/>
        <strong>Address:</strong> ${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}<br/>
        <strong>Type:</strong> ${addr.address_type}<br/>
        ${addr.description ? '<strong>Description:</strong> ' + addr.description + '<br/>' : ''}
        <strong>${t('status')}:</strong> ${addr.verified ? t('verified') : t('unverified')} | ${addr.public ? t('public') : t('private')}
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
          title: t('noAddressesFound'),
          description: t('noAddressesMatch'),
          variant: "destructive"
        });
        return;
      }

      // Create a simple CSV for Google My Maps import
      const headers = [t('googleMyMapsHeaders.name'), t('googleMyMapsHeaders.description'), t('googleMyMapsHeaders.latitude'), t('googleMyMapsHeaders.longitude')];
      const rows = addresses.map(addr => [
        `${addr.uac} - ${addr.building || addr.street}`,
        `${addr.building ? addr.building + ', ' : ''}${addr.street}, ${addr.city}, ${addr.region}. ${t('typeLabel')}: ${addr.address_type}${addr.description ? '. ' + addr.description : ''}`,
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
        title: t('exportCreated'),
        description: t('csvDownloadedGoogleMaps'),
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('exportFailed'),
        description: t('failedToExport'),
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
          title: t('noAddressesFound'),
          description: t('noAddressesMatch'),
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
        title: t('exportSuccessful'),
        description: t('exportedCount', { count: addresses.length, format: exportFormat.toUpperCase() }),
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('exportFailed'),
        description: t('failedToExport'),
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
          {t('exportAddresses')}
        </CardTitle>
        <CardDescription>
          {t('exportVariousFormats')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="uac-filter">{t('filterByUac')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="uac-filter"
                type="text"
                placeholder={t('enterUacPlaceholder')}
                value={uacFilter}
                onChange={(e) => setUacFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="export-format">{t('exportFormat')}</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">{t('csvSpreadsheet')}</SelectItem>
                <SelectItem value="kml">{t('kmlGoogleEarth')}</SelectItem>
                <SelectItem value="json">{t('jsonDevelopers')}</SelectItem>
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
              <Label htmlFor="verified-only">{t('verifiedAddressesOnly')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="include-private"
                checked={includePrivate}
                onCheckedChange={setIncludePrivate}
              />
              <Label htmlFor="include-private">{t('includePrivateAddresses')}</Label>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button onClick={handleExport} disabled={loading} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {loading ? t('exporting') : t('exportAs', { format: exportFormat.toUpperCase() })}
          </Button>
          
          <Button variant="outline" onClick={openInGoogleMyMaps} disabled={loading} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('exportToGoogleMyMaps')}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>CSV:</strong> {t('csvDescription')}</p>
          <p><strong>KML:</strong> {t('kmlDescription')}</p>
          <p><strong>JSON:</strong> {t('jsonDescription')}</p>
        </div>
      </CardContent>
    </Card>
  );
};