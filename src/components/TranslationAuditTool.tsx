import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, AlertTriangle, CheckCircle2, XCircle, FileText, Globe, Wrench, Download, BarChart3 } from 'lucide-react';
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
import postalEN from '../locales/en/postal.json';
import demoEN from '../locales/en/demo.json';

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import addressES from '../locales/es/address.json';
import emergencyES from '../locales/es/emergency.json';
import adminES from '../locales/es/admin.json';
import countriesES from '../locales/es/countries.json';
import carES from '../locales/es/car.json';
import businessES from '../locales/es/business.json';
import postalES from '../locales/es/postal.json';
import demoES from '../locales/es/demo.json';

import commonFR from '../locales/fr/common.json';
import authFR from '../locales/fr/auth.json';
import dashboardFR from '../locales/fr/dashboard.json';
import addressFR from '../locales/fr/address.json';
import emergencyFR from '../locales/fr/emergency.json';
import adminFR from '../locales/fr/admin.json';
import countriesFR from '../locales/fr/countries.json';
import carFR from '../locales/fr/car.json';
import businessFR from '../locales/fr/business.json';
import postalFR from '../locales/fr/postal.json';
import demoFR from '../locales/fr/demo.json';

const translations = {
  en: { common: commonEN, auth: authEN, dashboard: dashboardEN, address: addressEN, emergency: emergencyEN, admin: adminEN, countries: countriesEN, car: carEN, business: businessEN, postal: postalEN, demo: demoEN },
  es: { common: commonES, auth: authES, dashboard: dashboardES, address: addressES, emergency: emergencyES, admin: adminES, countries: countriesES, car: carES, business: businessES, postal: postalES, demo: demoES },
  fr: { common: commonFR, auth: authFR, dashboard: dashboardFR, address: addressFR, emergency: emergencyFR, admin: adminFR, countries: countriesFR, car: carFR, business: businessFR, postal: postalFR, demo: demoFR },
};

const namespaces = ['common', 'auth', 'dashboard', 'address', 'emergency', 'admin', 'countries', 'car', 'business', 'postal', 'demo'];

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

  // Structural comparison - identify orphaned vs missing keys
  const structuralReport = useMemo(() => {
    const enKeys = new Map<string, Set<string>>();
    const esKeys = new Map<string, Set<string>>();
    const frKeys = new Map<string, Set<string>>();

    // Collect keys by namespace for each language
    namespaces.forEach(ns => {
      enKeys.set(ns, new Set(getAllKeys(translations.en[ns as keyof typeof translations.en])));
      esKeys.set(ns, new Set(getAllKeys(translations.es[ns as keyof typeof translations.es])));
      frKeys.set(ns, new Set(getAllKeys(translations.fr[ns as keyof typeof translations.fr])));
    });

    // Find orphaned keys (exist in ES or FR but NOT in EN)
    const orphanedKeys: { namespace: string; key: string; existsIn: string[]; value: string }[] = [];
    // Find missing keys (exist in EN but missing in ES or FR)
    const missingFromES: { namespace: string; key: string; enValue: string }[] = [];
    const missingFromFR: { namespace: string; key: string; enValue: string }[] = [];

    namespaces.forEach(ns => {
      const en = enKeys.get(ns) || new Set();
      const es = esKeys.get(ns) || new Set();
      const fr = frKeys.get(ns) || new Set();

      // Orphaned: in ES but not EN
      es.forEach(key => {
        if (!en.has(key)) {
          const existsIn = ['ES'];
          if (fr.has(key)) existsIn.push('FR');
          const value = getNestedValue(translations.es[ns as keyof typeof translations.es], key);
          orphanedKeys.push({ namespace: ns, key, existsIn, value: typeof value === 'string' ? value : JSON.stringify(value) });
        }
      });

      // Orphaned: in FR but not EN (and not already counted from ES)
      fr.forEach(key => {
        if (!en.has(key) && !es.has(key)) {
          const value = getNestedValue(translations.fr[ns as keyof typeof translations.fr], key);
          orphanedKeys.push({ namespace: ns, key, existsIn: ['FR'], value: typeof value === 'string' ? value : JSON.stringify(value) });
        }
      });

      // Missing from ES: in EN but not ES
      en.forEach(key => {
        if (!es.has(key)) {
          const enValue = getNestedValue(translations.en[ns as keyof typeof translations.en], key);
          missingFromES.push({ namespace: ns, key, enValue: typeof enValue === 'string' ? enValue : JSON.stringify(enValue) });
        }
      });

      // Missing from FR: in EN but not FR
      en.forEach(key => {
        if (!fr.has(key)) {
          const enValue = getNestedValue(translations.en[ns as keyof typeof translations.en], key);
          missingFromFR.push({ namespace: ns, key, enValue: typeof enValue === 'string' ? enValue : JSON.stringify(enValue) });
        }
      });
    });

    // Group by namespace for summary
    const byNamespace = namespaces.map(ns => ({
      namespace: ns,
      enCount: enKeys.get(ns)?.size || 0,
      esCount: esKeys.get(ns)?.size || 0,
      frCount: frKeys.get(ns)?.size || 0,
      orphanedCount: orphanedKeys.filter(k => k.namespace === ns).length,
      missingESCount: missingFromES.filter(k => k.namespace === ns).length,
      missingFRCount: missingFromFR.filter(k => k.namespace === ns).length,
    }));

    return {
      orphanedKeys,
      missingFromES,
      missingFromFR,
      byNamespace,
      totalOrphaned: orphanedKeys.length,
      totalMissingES: missingFromES.length,
      totalMissingFR: missingFromFR.length,
    };
  }, []);

  const exportStructuralReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalOrphanedKeys: structuralReport.totalOrphaned,
        totalMissingFromES: structuralReport.totalMissingES,
        totalMissingFromFR: structuralReport.totalMissingFR,
      },
      byNamespace: structuralReport.byNamespace,
      orphanedKeys: structuralReport.orphanedKeys,
      missingFromES: structuralReport.missingFromES,
      missingFromFR: structuralReport.missingFromFR,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-structural-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="issues">Translation Issues</TabsTrigger>
          <TabsTrigger value="structural">Structural Report</TabsTrigger>
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

        <TabsContent value="structural" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Structural Comparison Report</h3>
              <p className="text-sm text-muted-foreground">
                Analysis of key structure differences between EN, ES, and FR translation files
              </p>
            </div>
            <Button onClick={exportStructuralReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orphaned Keys</CardTitle>
                <CardDescription>Keys in ES/FR but NOT in EN</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{structuralReport.totalOrphaned}</div>
                <p className="text-xs text-muted-foreground mt-1">May need removal or addition to EN</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missing from ES</CardTitle>
                <CardDescription>Keys in EN but NOT in ES</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{structuralReport.totalMissingES}</div>
                <p className="text-xs text-muted-foreground mt-1">Need Spanish translation</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missing from FR</CardTitle>
                <CardDescription>Keys in EN but NOT in FR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{structuralReport.totalMissingFR}</div>
                <p className="text-xs text-muted-foreground mt-1">Need French translation</p>
              </CardContent>
            </Card>
          </div>

          {/* By Namespace Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                By Namespace Breakdown
              </CardTitle>
              <CardDescription>Key counts and differences per translation namespace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Namespace</th>
                      <th className="text-right py-2 px-2">EN Keys</th>
                      <th className="text-right py-2 px-2">ES Keys</th>
                      <th className="text-right py-2 px-2">FR Keys</th>
                      <th className="text-right py-2 px-2 text-purple-600">Orphaned</th>
                      <th className="text-right py-2 px-2 text-orange-600">Missing ES</th>
                      <th className="text-right py-2 px-2 text-blue-600">Missing FR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structuralReport.byNamespace.map(ns => (
                      <tr key={ns.namespace} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 font-mono text-sm">{ns.namespace}</td>
                        <td className="text-right py-2 px-2">{ns.enCount}</td>
                        <td className="text-right py-2 px-2">{ns.esCount}</td>
                        <td className="text-right py-2 px-2">{ns.frCount}</td>
                        <td className="text-right py-2 px-2">
                          {ns.orphanedCount > 0 && (
                            <Badge variant="outline" className="text-purple-600">{ns.orphanedCount}</Badge>
                          )}
                        </td>
                        <td className="text-right py-2 px-2">
                          {ns.missingESCount > 0 && (
                            <Badge variant="outline" className="text-orange-600">{ns.missingESCount}</Badge>
                          )}
                        </td>
                        <td className="text-right py-2 px-2">
                          {ns.missingFRCount > 0 && (
                            <Badge variant="outline" className="text-blue-600">{ns.missingFRCount}</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Orphaned Keys Detail */}
          {structuralReport.orphanedKeys.length > 0 && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700">Orphaned Keys (ES/FR only, not in EN)</CardTitle>
                <CardDescription>
                  These keys exist in Spanish or French files but have no English equivalent. 
                  Either add them to EN or remove them from ES/FR.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {structuralReport.orphanedKeys.slice(0, 100).map((item, idx) => (
                      <div key={idx} className="p-2 bg-purple-50 rounded border border-purple-100">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-purple-100 px-1 rounded">{item.namespace}:{item.key}</code>
                          <Badge variant="secondary" className="text-xs">{item.existsIn.join(', ')}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.value}</p>
                      </div>
                    ))}
                    {structuralReport.orphanedKeys.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {structuralReport.orphanedKeys.length - 100} more. Export report for full list.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Missing from ES Detail */}
          {structuralReport.missingFromES.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700">Missing Spanish Translations</CardTitle>
                <CardDescription>
                  These keys exist in English but need Spanish translations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {structuralReport.missingFromES.slice(0, 100).map((item, idx) => (
                      <div key={idx} className="p-2 bg-orange-50 rounded border border-orange-100">
                        <code className="text-xs font-mono bg-orange-100 px-1 rounded">{item.namespace}:{item.key}</code>
                        <p className="text-xs text-muted-foreground mt-1 truncate">EN: {item.enValue}</p>
                      </div>
                    ))}
                    {structuralReport.missingFromES.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {structuralReport.missingFromES.length - 100} more. Export report for full list.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Missing from FR Detail */}
          {structuralReport.missingFromFR.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">Missing French Translations</CardTitle>
                <CardDescription>
                  These keys exist in English but need French translations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {structuralReport.missingFromFR.slice(0, 100).map((item, idx) => (
                      <div key={idx} className="p-2 bg-blue-50 rounded border border-blue-100">
                        <code className="text-xs font-mono bg-blue-100 px-1 rounded">{item.namespace}:{item.key}</code>
                        <p className="text-xs text-muted-foreground mt-1 truncate">EN: {item.enValue}</p>
                      </div>
                    ))}
                    {structuralReport.missingFromFR.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {structuralReport.missingFromFR.length - 100} more. Export report for full list.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
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
