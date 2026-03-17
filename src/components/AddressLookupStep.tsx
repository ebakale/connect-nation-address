import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Building, Home, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { cn } from '@/lib/utils';

interface AddressLookupStepProps {
  onAddressFound: (uac: string, details: any) => void;
  onCreateNew: () => void;
  onModeChange: (mode: 'citizen' | 'business') => void;
  initialMode: 'citizen' | 'business';
}

export function AddressLookupStep({ 
  onAddressFound, 
  onCreateNew, 
  onModeChange,
  initialMode 
}: AddressLookupStepProps) {
  const { t } = useTranslation(['address', 'common']);
  const [uacInput, setUacInput] = useState('');
  const [textQuery, setTextQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<'found' | 'not-found' | null>(null);
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [textResults, setTextResults] = useState<any[]>([]);
  const [searchTab, setSearchTab] = useState<'uac' | 'location'>('uac');
  const [mode, setMode] = useState<'citizen' | 'business'>(initialMode);
  const { lookupAddressByUAC, searchAddressesByText } = useCitizenAddresses();

  const handleUACSearch = async () => {
    if (!uacInput.trim()) return;

    setSearching(true);
    setSearchResult(null);
    setAddressDetails(null);

    try {
      const result = await lookupAddressByUAC(uacInput.trim());
      
      if (result) {
        setSearchResult('found');
        setAddressDetails(result);
      } else {
        setSearchResult('not-found');
      }
    } catch (error) {
      console.error('Address lookup error:', error);
      setSearchResult('not-found');
    } finally {
      setSearching(false);
    }
  };

  const handleTextSearch = async () => {
    if (!textQuery.trim() || textQuery.trim().length < 2) return;

    setSearching(true);
    setTextResults([]);
    setSearchResult(null);
    setAddressDetails(null);

    try {
      const results = await searchAddressesByText(textQuery.trim());
      setTextResults(results);
      setSearchResult(results.length > 0 ? 'found' : 'not-found');
    } catch (error) {
      console.error('Text search error:', error);
      setSearchResult('not-found');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    onAddressFound(result.uac, result);
  };

  const handleModeChange = (newMode: 'citizen' | 'business') => {
    setMode(newMode);
    onModeChange(newMode);
  };

  const handleContinue = () => {
    if (searchResult === 'found' && addressDetails) {
      onAddressFound(uacInput, addressDetails);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchTab === 'uac') handleUACSearch();
      else handleTextSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('address:unifiedFlow.whatAreYouRegistering')}
          </CardTitle>
          <CardDescription>
            {t('address:unifiedFlow.selectRegistrationType')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={handleModeChange} className="grid grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="citizen" id="mode-citizen" className="peer sr-only" />
              <Label
                htmlFor="mode-citizen"
                className={cn(
                  "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                  mode === 'citizen' && "border-primary bg-primary/5"
                )}
              >
                <Home className="h-8 w-8 mb-2" />
                <div className="text-center">
                  <p className="font-medium">{t('address:unifiedFlow.personalAddress')}</p>
                  <p className="text-sm text-muted-foreground">{t('address:unifiedFlow.personalAddressDesc')}</p>
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="business" id="mode-business" className="peer sr-only" />
              <Label
                htmlFor="mode-business"
                className={cn(
                  "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                  mode === 'business' && "border-primary bg-primary/5"
                )}
              >
                <Building className="h-8 w-8 mb-2" />
                <div className="text-center">
                  <p className="font-medium">{t('address:unifiedFlow.businessAddress')}</p>
                  <p className="text-sm text-muted-foreground">{t('address:unifiedFlow.businessAddressDesc')}</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Address Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('address:unifiedFlow.findAddress')}</CardTitle>
          <CardDescription>
            {t('address:unifiedFlow.enterUAC')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search mode tabs */}
          <Tabs value={searchTab} onValueChange={(v) => { setSearchTab(v as 'uac' | 'location'); setSearchResult(null); setTextResults([]); setAddressDetails(null); }}>
            <TabsList className="w-full">
              <TabsTrigger value="uac" className="flex-1">{t('address:unifiedFlow.searchByUAC')}</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">{t('address:unifiedFlow.searchByLocation')}</TabsTrigger>
            </TabsList>

            {/* UAC Search Tab */}
            <TabsContent value="uac" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">{t('address:unifiedFlow.whatIsUAC')}</p>
                  <p className="text-sm">{t('address:unifiedFlow.uacExplanation')}</p>
                  <p className="text-sm mt-1 font-mono text-primary">
                    {t('address:unifiedFlow.uacExample')}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="uac-input">{t('address:uacCode')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="uac-input"
                    value={uacInput}
                    onChange={(e) => setUacInput(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyPress}
                    placeholder={t('address:unifiedFlow.uacPlaceholder')}
                    className="font-mono flex-1"
                    disabled={searching}
                  />
                  <Button 
                    onClick={handleUACSearch} 
                    disabled={!uacInput.trim() || searching}
                    className="min-w-[100px]"
                  >
                    {searching ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common:searching')}</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" />{t('common:search')}</>
                    )}
                  </Button>
                </div>
              </div>

              {/* UAC Found */}
              {searchResult === 'found' && addressDetails && (
                <Alert className="border-success bg-success/5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-success mb-2">{t('address:unifiedFlow.addressFound')}</p>
                        <AddressDetail address={addressDetails} />
                      </div>
                      <Button onClick={handleContinue} className="w-full">
                        {t('address:unifiedFlow.continueWithAddress')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* UAC Not Found */}
              {searchResult === 'not-found' && (
                <NotFoundAlert onCreateNew={onCreateNew} t={t} />
              )}
            </TabsContent>

            {/* Location Search Tab */}
            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-search">{t('address:unifiedFlow.searchByLocation')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-search"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t('address:unifiedFlow.locationSearchPlaceholder')}
                    className="flex-1"
                    disabled={searching}
                  />
                  <Button 
                    onClick={handleTextSearch} 
                    disabled={!textQuery.trim() || textQuery.trim().length < 2 || searching}
                    className="min-w-[100px]"
                  >
                    {searching ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common:searching')}</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" />{t('common:search')}</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Text Search Results */}
              {searchResult === 'found' && textResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('address:unifiedFlow.multipleResultsFound', { count: textResults.length })}
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {textResults.map((result: any) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-sm truncate">{result.street}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-5.5 mt-0.5">
                              {result.city}, {result.region}
                              {result.building && ` · ${result.building}`}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground ml-5.5 mt-0.5">{result.uac}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {result.verified && (
                              <Badge variant="default" className="bg-success text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('address:verified')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResult === 'not-found' && (
                <NotFoundAlert onCreateNew={onCreateNew} t={t} />
              )}
            </TabsContent>
          </Tabs>

          {/* Quick create option */}
          {!searchResult && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {t('address:unifiedFlow.dontHaveUAC')}
              </p>
              <Button onClick={onCreateNew} variant="outline" className="w-full">
                {t('address:unifiedFlow.createAddressFirst')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddressDetail({ address }: { address: any }) {
  const { t } = useTranslation(['address', 'common']);
  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{address.street}</span>
      </div>
      <p className="text-muted-foreground pl-5">
        {address.city}, {address.region}
      </p>
      {address.building && (
        <p className="text-muted-foreground pl-5">
          {t('common:building')}: {address.building}
        </p>
      )}
      <div className="flex items-center gap-2 pl-5 pt-1">
        {address.verified && (
          <Badge variant="default" className="bg-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('address:verified')}
          </Badge>
        )}
        {address.public && (
          <Badge variant="secondary">
            {t('address:publicAddress')}
          </Badge>
        )}
      </div>
    </div>
  );
}

function NotFoundAlert({ onCreateNew, t }: { onCreateNew: () => void; t: any }) {
  return (
    <Alert className="border-muted-foreground">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium mb-1">{t('address:unifiedFlow.addressNotFound')}</p>
            <p className="text-sm text-muted-foreground">{t('address:unifiedFlow.addressNotFoundHelp')}</p>
          </div>
          <Button onClick={onCreateNew} variant="default" className="w-full">
            <Building className="h-4 w-4 mr-2" />
            {t('address:unifiedFlow.createNewAddress')}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
