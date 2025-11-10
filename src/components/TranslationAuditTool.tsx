import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, AlertTriangle, CheckCircle2, XCircle, FileText, Globe, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TranslationFixDialog } from './TranslationFixDialog';
import { supabase } from '@/integrations/supabase/client';

// Import all translation files
import commonEN from '../locales/en/common.json';
import authEN from '../locales/en/auth.json';
import dashboardEN from '../locales/en/dashboard.json';
import addressEN from '../locales/en/address.json';
import emergencyEN from '../locales/en/emergency.json';
import adminEN from '../locales/en/admin.json';
import countriesEN from '../locales/en/countries.json';
import carEN from '../locales/en/car.json';
import businessEN from '../locales/en/business.json';

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import addressES from '../locales/es/address.json';
import emergencyES from '../locales/es/emergency.json';
import adminES from '../locales/es/admin.json';
import countriesES from '../locales/es/countries.json';
import carES from '../locales/es/car.json';
import businessES from '../locales/es/business.json';

import commonFR from '../locales/fr/common.json';
import authFR from '../locales/fr/auth.json';
import dashboardFR from '../locales/fr/dashboard.json';
import addressFR from '../locales/fr/address.json';
import emergencyFR from '../locales/fr/emergency.json';
import adminFR from '../locales/fr/admin.json';
import countriesFR from '../locales/fr/countries.json';
import carFR from '../locales/fr/car.json';
import businessFR from '../locales/fr/business.json';

const translations = {
  en: { common: commonEN, auth: authEN, dashboard: dashboardEN, address: addressEN, emergency: emergencyEN, admin: adminEN, countries: countriesEN, car: carEN, business: businessEN },
  es: { common: commonES, auth: authES, dashboard: dashboardES, address: addressES, emergency: emergencyES, admin: adminES, countries: countriesES, car: carES, business: businessES },
  fr: { common: commonFR, auth: authFR, dashboard: dashboardFR, address: addressFR, emergency: emergencyFR, admin: adminFR, countries: countriesFR, car: carFR, business: businessFR },
};

const namespaces = ['common', 'auth', 'dashboard', 'address', 'emergency', 'admin', 'countries', 'car', 'business'];

interface TranslationIssue {
  key: string;
  namespace: string;
  type: 'missing' | 'incomplete' | 'empty';
  missingIn: string[];
  values: { [lang: string]: string };
}

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function TranslationAuditTool() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [editingIssue, setEditingIssue] = useState<TranslationIssue | null>(null);
  const [fixedCount, setFixedCount] = useState(0);

  // Load applied fixes count on mount
  useEffect(() => {
    const loadFixedCount = async () => {
      const { count } = await supabase
        .from('translation_fixes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'applied');
      
      if (count) {
        setFixedCount(count);
      }
    };
    
    loadFixedCount();
  }, []);

  const auditResults = useMemo(() => {
    const issues: TranslationIssue[] = [];
    const allKeys = new Set<string>();

    // Collect all unique keys from all namespaces and languages
    namespaces.forEach(ns => {
      ['en', 'es', 'fr'].forEach(lang => {
        const keys = getAllKeys(translations[lang as keyof typeof translations][ns as keyof typeof translations.en]);
        keys.forEach(key => allKeys.add(`${ns}:${key}`));
      });
    });

    // Check each key across all languages
    allKeys.forEach(fullKey => {
      const [namespace, ...keyParts] = fullKey.split(':');
      const key = keyParts.join(':');
      
      const enValue = getNestedValue(translations.en[namespace as keyof typeof translations.en], key);
      const esValue = getNestedValue(translations.es[namespace as keyof typeof translations.es], key);
      const frValue = getNestedValue(translations.fr[namespace as keyof typeof translations.fr], key);

      const missingIn: string[] = [];
      const values: { [lang: string]: string } = {};

      if (!enValue) missingIn.push('EN');
      else values.en = enValue;
      
      if (!esValue) missingIn.push('ES');
      else values.es = esValue;
      
      if (!frValue) missingIn.push('FR');
      else values.fr = frValue;

      if (missingIn.length > 0) {
        issues.push({
          key,
          namespace,
          type: missingIn.length === 3 ? 'missing' : 'incomplete',
          missingIn,
          values,
        });
      } else if (
        (typeof enValue === 'string' && !enValue.trim()) || 
        (typeof esValue === 'string' && !esValue.trim()) || 
        (typeof frValue === 'string' && !frValue.trim())
      ) {
        issues.push({
          key,
          namespace,
          type: 'empty',
          missingIn: [],
          values,
        });
      }
    });

    return issues;
  }, []);

  const filteredIssues = useMemo(() => {
    return auditResults.filter(issue => {
      const matchesSearch = !searchTerm || 
        issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(issue.values).some(v => 
          typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesNamespace = selectedNamespace === 'all' || issue.namespace === selectedNamespace;
      return matchesSearch && matchesNamespace;
    });
  }, [auditResults, searchTerm, selectedNamespace]);

  const stats = useMemo(() => {
    const totalKeys = new Set<string>();
    namespaces.forEach(ns => {
      getAllKeys(translations.en[ns as keyof typeof translations.en]).forEach(key => 
        totalKeys.add(`${ns}:${key}`)
      );
    });

    return {
      total: totalKeys.size,
      issues: auditResults.length,
      missing: auditResults.filter(i => i.type === 'missing').length,
      incomplete: auditResults.filter(i => i.type === 'incomplete').length,
      empty: auditResults.filter(i => i.type === 'empty').length,
      healthy: totalKeys.size - auditResults.length,
    };
  }, [auditResults]);

  const commonPatterns = [
    { pattern: /\{t\(['"`]([^'"`]+)['"`]\)\}/g, description: 't() function calls', example: "{t('common:welcome')}" },
    { pattern: /t\(['"`]([^'"`:]+):([^'"`]+)['"`]\)/g, description: 'Namespaced translations', example: "t('address:title')" },
    { pattern: /\$\{[^}]*\.toLowerCase\(\)\}/g, description: 'Dynamic keys with toLowerCase()', example: "${address_type.toLowerCase()}" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Audit Tool</h1>
          <p className="text-muted-foreground">Scan and identify translation issues across the application</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Globe className="w-4 h-4 mr-2" />
          Current: {i18n.language.toUpperCase()}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.issues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.missing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Incomplete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.incomplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.empty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Translation Best Practices</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Always use <code className="bg-muted px-1 rounded">t('namespace:key')</code> for all user-facing text</li>
            <li>Apply <code className="bg-muted px-1 rounded">.toLowerCase()</code> to database values before translation</li>
            <li>Never display raw translation keys like "address:something"</li>
            <li>Never display raw database enum values like "PRIMARY", "RESIDENTIAL", "BUILDING"</li>
            <li>Ensure all three languages (EN, ES, FR) have complete translations</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="issues">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">Translation Issues</TabsTrigger>
          <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
          <TabsTrigger value="checklist">Component Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find specific translation keys or values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search keys or translations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  className="border rounded-md px-3"
                >
                  <option value="all">All Namespaces</option>
                  {namespaces.map(ns => (
                    <option key={ns} value={ns}>{ns}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issues Found ({filteredIssues.length})</CardTitle>
              <CardDescription>Translation keys that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {filteredIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold">No Issues Found!</h3>
                    <p className="text-muted-foreground">All translations are complete and healthy.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredIssues.map((issue, idx) => (
                      <Card key={idx} className="border-l-4" style={{
                        borderLeftColor: issue.type === 'missing' ? '#ef4444' : issue.type === 'incomplete' ? '#f59e0b' : '#3b82f6'
                      }}>
                         <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-mono">{issue.namespace}:{issue.key}</CardTitle>
                              <div className="flex gap-2 mt-2">
                                <Badge variant={issue.type === 'missing' ? 'destructive' : 'outline'}>
                                  {issue.type}
                                </Badge>
                                {issue.missingIn.map(lang => (
                                  <Badge key={lang} variant="secondary">{lang} missing</Badge>
                                ))}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingIssue(issue)}
                              className="ml-2"
                            >
                              <Wrench className="w-4 h-4 mr-1" />
                              Fix
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {issue.values.en && (
                              <div><strong>EN:</strong> {issue.values.en}</div>
                            )}
                            {issue.values.es && (
                              <div><strong>ES:</strong> {issue.values.es}</div>
                            )}
                            {issue.values.fr && (
                              <div><strong>FR:</strong> {issue.values.fr}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Translation Patterns</CardTitle>
              <CardDescription>Reference guide for proper translation usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="basic">
                  <AccordionTrigger>Basic Translation</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <code className="block bg-muted p-3 rounded">
                      {`// ❌ WRONG\n<h1>Welcome</h1>\n\n// ✅ CORRECT\n<h1>{t('common:welcome')}</h1>`}
                    </code>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dynamic">
                  <AccordionTrigger>Dynamic Values (Database Enums)</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <code className="block bg-muted p-3 rounded">
                      {`// ❌ WRONG - Displays "RESIDENTIAL"\n{address.address_type}\n\n// ✅ CORRECT - Displays "Residential"\n{t(\`address:addressType.\${address.address_type.toLowerCase()}\`)}`}
                    </code>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nested">
                  <AccordionTrigger>Nested Objects (Scope, Occupant, Status)</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <code className="block bg-muted p-3 rounded">
                      {`// ❌ WRONG - Displays "BUILDING", "OWNER"\n{address.scope} - {address.occupant}\n\n// ✅ CORRECT - Displays "Building - Owner"\n{t(\`address:scopeType.\${address.scope.toLowerCase()}\`)} - {t(\`address:occupant.\${address.occupant.toLowerCase()}\`)}`}
                    </code>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="labels">
                  <AccordionTrigger>Labels and Headings</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <code className="block bg-muted p-3 rounded">
                      {`// ❌ WRONG\n<Label>Email Address</Label>\n\n// ✅ CORRECT\n<Label>{t('common:email')}</Label>`}
                    </code>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="buttons">
                  <AccordionTrigger>Buttons and Actions</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <code className="block bg-muted p-3 rounded">
                      {`// ❌ WRONG\n<Button>Save Changes</Button>\n\n// ✅ CORRECT\n<Button>{t('common:save')}</Button>`}
                    </code>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Component Audit Checklist</CardTitle>
              <CardDescription>Use this checklist when reviewing components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">High Priority Components (Citizen View)</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>AddressHistoryPanel.tsx</strong> - ✅ Fixed
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>CurrentAddressesPanel.tsx</strong> - ✅ Fixed
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>AddressRequestStatus.tsx</strong> - ✅ Fixed
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1" />
                      <div>
                        <strong>HouseholdManagement.tsx</strong> - ⚠️ Needs review
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1" />
                      <div>
                        <strong>SetPrimaryAddressForm.tsx</strong> - ⚠️ Needs review
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1" />
                      <div>
                        <strong>AddSecondaryAddressForm.tsx</strong> - ⚠️ Needs review
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Search for These Anti-Patterns</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-1" />
                      <code>Hardcoded text between JSX tags: &lt;p&gt;Some text&lt;/p&gt;</code>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-1" />
                      <code>Raw enum values: {`{address.address_type}`} or {`{address.scope}`}</code>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-1" />
                      <code>Missing .toLowerCase(): t(`key.$&#123;value&#125;`)</code>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-1" />
                      <code>Hardcoded strings in placeholders: placeholder="Enter name"</code>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-1" />
                      <code>Hardcoded button text: &lt;Button&gt;Save&lt;/Button&gt;</code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Testing Checklist</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1" />
                      <span>Navigate to /dashboard and check all tabs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1" />
                      <span>Switch between EN, ES, and FR languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1" />
                      <span>Look for any text still in English when FR/ES is selected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1" />
                      <span>Check for "address:" or "common:" prefixes in displayed text</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1" />
                      <span>Verify uppercase database values (PRIMARY, RESIDENTIAL) are translated</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TranslationFixDialog 
        issue={editingIssue}
        open={!!editingIssue}
        onOpenChange={(open) => !open && setEditingIssue(null)}
        onSuccess={() => {
          setFixedCount(prev => prev + 1);
        }}
      />

      {fixedCount > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Active Translation Fixes</AlertTitle>
          <AlertDescription>
            {fixedCount} translation fix{fixedCount !== 1 ? 'es are' : ' is'} currently applied to the application. These overrides will persist until removed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
