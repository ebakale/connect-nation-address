import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  validateUAC, 
  parseUAC, 
  generateUAC, 
  getRegionCodes, 
  getCityCodes, 
  getCountryCodes 
} from '@/lib/uacGenerator';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Info, 
  Hash, 
  Globe,
  MapPin,
  Building,
  RefreshCw
} from 'lucide-react';

interface UACRecord {
  uac: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  verified: boolean;
  public: boolean;
  created_at: string;
}

export const UACManager: React.FC = () => {
  const [uacRecords, setUacRecords] = useState<UACRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationUAC, setValidationUAC] = useState('');
  const [testCountry, setTestCountry] = useState('Equatorial Guinea');
  const [testRegion, setTestRegion] = useState('Bioko Norte');
  const [testCity, setTestCity] = useState('Malabo');
  const [generatedUAC, setGeneratedUAC] = useState('');
  const { hasAdminAccess, hasNDAAAccess, hasSystemAdminAccess } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (hasAdminAccess) {
      fetchUACRecords();
    }
  }, [hasAdminAccess]);

  const fetchUACRecords = async () => {
    try {
      setLoading(true);
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('uac, country, region, city, street, building, address_type, verified, public, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setUacRecords(addresses || []);
    } catch (error) {
      console.error('Error fetching UAC records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch UAC records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateUAC = () => {
    if (!validationUAC.trim()) {
      toast({
        title: "Error",
        description: "Please enter a UAC to validate",
        variant: "destructive"
      });
      return;
    }

    const isValid = validateUAC(validationUAC);
    const parsed = parseUAC(validationUAC);

    if (isValid && parsed) {
      toast({
        title: "Valid UAC",
        description: `UAC is valid. Country: ${parsed.country}, Region: ${parsed.region}, City: ${parsed.city}`,
      });
    } else {
      toast({
        title: "Invalid UAC",
        description: "The UAC format is invalid or the check digit doesn't match",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTestUAC = async () => {
    try {
      const uac = await generateUAC(testCountry, testRegion, testCity);
      setGeneratedUAC(uac);
      toast({
        title: "UAC Generated",
        description: `New UAC: ${uac}`,
      });
    } catch (error) {
      console.error('Error generating UAC:', error);
      toast({
        title: "Error", 
        description: "Failed to generate UAC",
        variant: "destructive"
      });
    }
  };

  const filteredRecords = uacRecords.filter(record =>
    record.uac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            UAC Management
          </CardTitle>
          <CardDescription>
            Access denied. Admin privileges required.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const countryCodes = getCountryCodes();
  const regionCodes = getRegionCodes();
  const cityCodes = getCityCodes();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Unified Address Code (UAC) Management
          </CardTitle>
          <CardDescription>
            Manage and validate the standardized address coding system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Overview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>UAC Format:</strong> [COUNTRY]-[REGION]-[CITY]-[SEQUENCE]-[CHECK]<br />
              <strong>Example:</strong> GQ-BN-MAL-001A23-7K (Equatorial Guinea, Bioko Norte, Malabo)
            </AlertDescription>
          </Alert>

          {/* UAC Validation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">UAC Validation</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="validation-uac">Enter UAC to validate</Label>
                <Input
                  id="validation-uac"
                  value={validationUAC}
                  onChange={(e) => setValidationUAC(e.target.value.toUpperCase())}
                  placeholder="e.g., GQ-BN-MAL-001A23-7K"
                  className="font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleValidateUAC}>
                  Validate
                </Button>
              </div>
            </div>
            {validationUAC && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {validateUAC(validationUAC) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {validateUAC(validationUAC) ? 'Valid UAC' : 'Invalid UAC'}
                  </span>
                </div>
                {(() => {
                  const parsed = parseUAC(validationUAC);
                  if (parsed) {
                    return (
                      <div className="text-sm space-y-1">
                        <div>Country: {parsed.country} ({countryCodes[Object.keys(countryCodes).find(k => countryCodes[k] === parsed.country) || ''] || 'Unknown'})</div>
                        <div>Region: {parsed.region} ({Object.keys(regionCodes).find(k => regionCodes[k] === parsed.region) || 'Unknown'})</div>
                        <div>City: {parsed.city} ({Object.keys(cityCodes).find(k => cityCodes[k] === parsed.city) || 'Unknown'})</div>
                        <div>Sequence: {parsed.sequence}</div>
                        <div>Check Digit: {parsed.checkDigit}</div>
                      </div>
                    );
                  }
                  return <div className="text-sm text-muted-foreground">Invalid format</div>;
                })()}
              </div>
            )}
          </div>

          <Separator />

          {/* UAC Generation Testing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Test UAC Generation</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test-country">Country</Label>
                <Input
                  id="test-country"
                  value={testCountry}
                  onChange={(e) => setTestCountry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-region">Region</Label>
                <Input
                  id="test-region"
                  value={testRegion}
                  onChange={(e) => setTestRegion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-city">City</Label>
                <Input
                  id="test-city"
                  value={testCity}
                  onChange={(e) => setTestCity(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={handleGenerateTestUAC}>
                Generate Test UAC
              </Button>
              {generatedUAC && (
                <div className="flex-1">
                  <Label>Generated UAC</Label>
                  <Input
                    value={generatedUAC}
                    readOnly
                    className="font-mono bg-muted"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* UAC Records Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">UAC Records ({filteredRecords.length})</h3>
              <Button variant="outline" onClick={fetchUACRecords}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search UAC records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading UAC records...</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UAC</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.uac}>
                        <TableCell className="font-mono text-sm">
                          {record.uac}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <div>
                              {record.building && `${record.building}, `}
                              {record.street}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <div>
                              {record.city}, {record.region}
                              <div className="text-xs text-muted-foreground">{record.country}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {record.address_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {record.verified && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                            {record.public && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Public
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(record.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {validateUAC(record.uac) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredRecords.length === 0 && !loading && (
              <div className="text-center py-8">
                <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No UAC records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UACManager;