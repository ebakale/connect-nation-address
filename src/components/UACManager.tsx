import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  const { t } = useTranslation(['admin']);
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
        title: t('error'),
        description: t('failedToFetchUacRecords'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateUAC = () => {
    if (!validationUAC.trim()) {
      toast({
        title: t('error'),
        description: t('pleaseEnterUacToValidate'),
        variant: "destructive"
      });
      return;
    }

    const isValid = validateUAC(validationUAC);
    const parsed = parseUAC(validationUAC);

    if (isValid && parsed) {
      toast({
        title: t('validUac'),
        description: t('uacValidationSuccess', { 
          country: parsed.country, 
          region: parsed.region, 
          city: parsed.city 
        }),
      });
    } else {
      toast({
        title: t('invalidUac'),
        description: t('uacValidationError'),
        variant: "destructive"
      });
    }
  };

  const handleGenerateTestUAC = async () => {
    try {
      const uac = await generateUAC(testCountry, testRegion, testCity);
      setGeneratedUAC(uac);
      toast({
        title: t('uacGenerated'),
        description: t('newUacGenerated', { uac }),
      });
    } catch (error) {
      console.error('Error generating UAC:', error);
      toast({
        title: t('error'), 
        description: t('failedToGenerateUac'),
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
            {t('admin:uacManagement')}
          </CardTitle>
          <CardDescription>
            {t('admin:accessDenied')}
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
            {t('admin:unifiedAddressCodeManagement')}
          </CardTitle>
          <CardDescription>
            {t('admin:manageValidateAddressCoding')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Overview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('uacFormatLabel')}:</strong> [COUNTRY]-[REGION]-[CITY]-[SEQUENCE]-[CHECK]<br />
              <strong>{t('exampleLabel')}:</strong> GQ-BN-MAL-001A23-7K ({t('exampleDescription')})
            </AlertDescription>
          </Alert>

          {/* UAC Validation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">{t('admin:uacValidation')}</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="validation-uac">{t('enterUacToValidate')}</Label>
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
                  {t('validate')}
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
                    {validateUAC(validationUAC) ? t('validUac') : t('invalidUac')}
                  </span>
                </div>
                {(() => {
                  const parsed = parseUAC(validationUAC);
                  if (parsed) {
                    return (
                      <div className="text-sm space-y-1">
                        <div>{t('country')}: {parsed.country} ({countryCodes[Object.keys(countryCodes).find(k => countryCodes[k] === parsed.country) || ''] || t('unknown')})</div>
                        <div>{t('region')}: {parsed.region} ({Object.keys(regionCodes).find(k => regionCodes[k] === parsed.region) || t('unknown')})</div>
                        <div>{t('city')}: {parsed.city} ({Object.keys(cityCodes).find(k => cityCodes[k] === parsed.city) || t('unknown')})</div>
                        <div>{t('sequence')}: {parsed.sequence}</div>
                        <div>{t('checkDigit')}: {parsed.checkDigit}</div>
                      </div>
                    );
                  }
                  return <div className="text-sm text-muted-foreground">{t('invalidFormat')}</div>;
                })()}
              </div>
            )}
          </div>

          <Separator />

          {/* UAC Generation Testing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">{t('generateTestUac')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test-country">{t('country')}</Label>
                <Input
                  id="test-country"
                  value={testCountry}
                  onChange={(e) => setTestCountry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-region">{t('region')}</Label>
                <Input
                  id="test-region"
                  value={testRegion}
                  onChange={(e) => setTestRegion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-city">{t('city')}</Label>
                <Input
                  id="test-city"
                  value={testCity}
                  onChange={(e) => setTestCity(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={handleGenerateTestUAC}>
                {t('generateTestUac')}
              </Button>
              {generatedUAC && (
                <div className="flex-1">
                  <Label>{t('generatedUac')}</Label>
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
              <h3 className="text-lg font-semibold">{t('uacRecords')} ({filteredRecords.length})</h3>
              <Button variant="outline" onClick={fetchUACRecords}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('refresh')}
              </Button>
            </div>
            
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchUacRecords')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('loadingUacRecords')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Accordion type="single" collapsible className="w-full">
                  {filteredRecords.map((record, index) => (
                    <AccordionItem key={record.uac} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4 overflow-hidden">
                          <div className="space-y-1">
                            <div className="font-mono text-sm font-medium break-all">{record.uac}</div>
                            <div className="text-sm text-muted-foreground break-words">
                              {record.building && `${record.building}, `}
                              {record.street}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            {validateUAC(record.uac) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {(() => {
                                const v = record.address_type as string | undefined;
                                const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                                const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                                const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                                return safe;
                              })()}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('address')}</div>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <div className="break-words">
                                  {record.building && `${record.building}, `}
                                  {record.street}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('location')}</div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <div className="break-words">
                                  {record.city}, {record.region}
                                  <div className="text-xs text-muted-foreground">{record.country}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('created')}</div>
                              <div className="text-sm">
                                {new Date(record.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('status')}</div>
                              <div className="flex gap-2 flex-wrap">
                                {record.verified && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    {t('verified')}
                                  </Badge>
                                )}
                                {record.public && (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                                    {t('public')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('uacValidation')}</div>
                              <div className="flex items-center gap-2">
                                {validateUAC(record.uac) ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">{t('valid')}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-red-600">{t('invalid')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">{t('addressType')}</div>
                              <Badge variant="outline" className="text-xs">
                                {(() => {
                                  const v = record.address_type as string | undefined;
                                  const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                                  const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                                  const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                                  return safe;
                                })()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {filteredRecords.length === 0 && !loading && (
              <div className="text-center py-8">
                <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">{t('noUacRecordsFound')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UACManager;