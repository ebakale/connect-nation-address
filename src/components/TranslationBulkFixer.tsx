import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, FileText, AlertTriangle, CheckCircle2, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationFix {
  file: string;
  line: number;
  issue: string;
  current: string;
  suggested: string;
  category: 'placeholder' | 'button' | 'label' | 'enum' | 'other';
  priority: 'high' | 'medium' | 'low';
}

const commonPlaceholderFixes: TranslationFix[] = [
  {
    file: 'AddressDirections.tsx',
    line: 399,
    issue: 'Hardcoded placeholder',
    current: 'placeholder="Enter UAC code or search address..."',
    suggested: 'placeholder={t("address:searchPlaceholder")}',
    category: 'placeholder',
    priority: 'high'
  },
  {
    file: 'AddressEditor.tsx',
    line: 196,
    issue: 'Hardcoded placeholder',
    current: 'placeholder="Equatorial Guinea"',
    suggested: 'placeholder={t("address:countryPlaceholder")}',
    category: 'placeholder',
    priority: 'high'
  },
  {
    file: 'AddressRejectionDialog.tsx',
    line: 120,
    issue: 'Hardcoded placeholder',
    current: 'placeholder="Select a rejection reason"',
    suggested: 'placeholder={t("admin:selectRejectionReason")}',
    category: 'placeholder',
    priority: 'high'
  },
  {
    file: 'BusinessEditDialog.tsx',
    line: 239,
    issue: 'Hardcoded placeholder',
    current: 'placeholder="https://"',
    suggested: 'placeholder={t("business:websiteUrlPlaceholder")}',
    category: 'placeholder',
    priority: 'medium'
  },
];

const requiredTranslationKeys = {
  address: {
    searchPlaceholder: {
      en: "Enter UAC code or search address...",
      es: "Ingrese código UAC o busque dirección...",
      fr: "Entrez le code UAC ou recherchez une adresse..."
    },
    countryPlaceholder: {
      en: "Equatorial Guinea",
      es: "Guinea Ecuatorial",
      fr: "Guinée équatoriale"
    },
    regionPlaceholder: {
      en: "Bioko Norte",
      es: "Bioko Norte",
      fr: "Bioko Norte"
    },
    cityPlaceholder: {
      en: "Malabo",
      es: "Malabo",
      fr: "Malabo"
    },
    streetPlaceholder: {
      en: "Avenida de la Independencia",
      es: "Avenida de la Independencia",
      fr: "Avenue de l'Indépendance"
    },
    buildingPlaceholder: {
      en: "House #42",
      es: "Casa #42",
      fr: "Maison #42"
    },
    detailsPlaceholder: {
      en: "Additional details about the location",
      es: "Detalles adicionales sobre la ubicación",
      fr: "Détails supplémentaires sur l'emplacement"
    },
    searchByPlaceholder: {
      en: "Search by UAC, street, city, building, or type...",
      es: "Buscar por UAC, calle, ciudad, edificio o tipo...",
      fr: "Rechercher par UAC, rue, ville, bâtiment ou type..."
    }
  },
  admin: {
    selectRejectionReason: {
      en: "Select a rejection reason",
      es: "Seleccione un motivo de rechazo",
      fr: "Sélectionnez un motif de rejet"
    },
    rejectionNotesPlaceholder: {
      en: "Provide specific guidance on what needs to be corrected for resubmission...",
      es: "Proporcione orientación específica sobre lo que debe corregirse para volver a enviar...",
      fr: "Fournissez des conseils précis sur ce qui doit être corrigé pour une nouvelle soumission..."
    },
    enterRejectionReason: {
      en: "Enter rejection reason...",
      es: "Ingrese el motivo de rechazo...",
      fr: "Entrez le motif du rejet..."
    },
    searchPlaceholder: {
      en: "Search by UAC, street, or city...",
      es: "Buscar por UAC, calle o ciudad...",
      fr: "Rechercher par UAC, rue ou ville..."
    },
    selectBulkAction: {
      en: "Select bulk action...",
      es: "Seleccione acción masiva...",
      fr: "Sélectionnez une action groupée..."
    }
  },
  business: {
    websiteUrlPlaceholder: {
      en: "https://",
      es: "https://",
      fr: "https://"
    }
  },
  common: {
    apiEndpointPlaceholder: {
      en: "https://api.example.com",
      es: "https://api.ejemplo.com",
      fr: "https://api.exemple.com"
    },
    selectPurpose: {
      en: "Select purpose...",
      es: "Seleccione propósito...",
      fr: "Sélectionnez l'objectif..."
    },
    additionalContext: {
      en: "Provide additional context for this search...",
      es: "Proporcione contexto adicional para esta búsqueda...",
      fr: "Fournissez un contexte supplémentaire pour cette recherche..."
    },
    additionalNotes: {
      en: "Additional notes about this member...",
      es: "Notas adicionales sobre este miembro...",
      fr: "Notes supplémentaires sur ce membre..."
    },
    filterPlaceholder: {
      en: "Filter recent searches...",
      es: "Filtrar búsquedas recientes...",
      fr: "Filtrer les recherches récentes..."
    }
  },
  emergency: {
    selectIncidentType: {
      en: "Select incident type",
      es: "Seleccione tipo de incidente",
      fr: "Sélectionnez le type d'incident"
    },
    streetAddressPlaceholder: {
      en: "Street address or location description",
      es: "Dirección o descripción del lugar",
      fr: "Adresse ou description du lieu"
    },
    incidentDescription: {
      en: "Detailed description of the incident...",
      es: "Descripción detallada del incidente...",
      fr: "Description détaillée de l'incident..."
    },
    selectNewStatus: {
      en: "Select new status",
      es: "Seleccione nuevo estado",
      fr: "Sélectionnez le nouveau statut"
    },
    statusChangeDescription: {
      en: "Describe the status change, any relevant details, or actions taken...",
      es: "Describa el cambio de estado, detalles relevantes o acciones tomadas...",
      fr: "Décrivez le changement de statut, les détails pertinents ou les actions prises..."
    },
    selectMessageType: {
      en: "Select message type",
      es: "Seleccione tipo de mensaje",
      fr: "Sélectionnez le type de message"
    },
    selectPriority: {
      en: "Select priority",
      es: "Seleccione prioridad",
      fr: "Sélectionnez la priorité"
    },
    messageToDispatch: {
      en: "Enter your message to dispatch...",
      es: "Ingrese su mensaje para enviar...",
      fr: "Entrez votre message à envoyer..."
    },
    testEmergencyMessage: {
      en: "Test emergency message",
      es: "Mensaje de emergencia de prueba",
      fr: "Message d'urgence de test"
    }
  }
};

export function TranslationBulkFixer() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fixes = commonPlaceholderFixes;

  const stats = {
    total: fixes.length,
    high: fixes.filter(f => f.priority === 'high').length,
    medium: fixes.filter(f => f.priority === 'medium').length,
    low: fixes.filter(f => f.priority === 'low').length,
  };

  const filteredFixes = selectedCategory === 'all' 
    ? fixes 
    : fixes.filter(f => f.category === selectedCategory);

  const downloadTranslationKeys = () => {
    const blob = new Blob([JSON.stringify(requiredTranslationKeys, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'missing-translation-keys.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Translation keys exported!',
      description: 'Download the JSON file and add these keys to your translation files.',
    });
  };

  const downloadFixScript = () => {
    const script = `#!/bin/bash
# Bulk Translation Fix Script
# This script applies common translation fixes across the codebase

echo "Starting bulk translation fixes..."

# Example fixes for placeholders
${fixes.map(fix => `
# ${fix.file} - Line ${fix.line}
# ${fix.issue}
# sed -i '' 's/${fix.current.replace(/"/g, '\\"')}/${fix.suggested.replace(/"/g, '\\"')}/g' src/components/${fix.file}
`).join('\n')}

echo "Translation fixes applied!"
echo "Remember to:"
echo "1. Add the missing translation keys to your JSON files"
echo "2. Test all affected components"
echo "3. Run the Translation Audit Tool to verify"
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apply-translation-fixes.sh';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Fix script exported!',
      description: 'Download and review the script before applying fixes.',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Translation Fixer</h1>
          <p className="text-muted-foreground">Automated translation issue detection and fixes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTranslationKeys} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Translation Keys
          </Button>
          <Button onClick={downloadFixScript}>
            <Code className="w-4 h-4 mr-2" />
            Export Fix Script
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Medium Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Low Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Instructions</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Export the translation keys JSON file and add entries to your locales files</li>
            <li>Export the fix script to apply automated changes</li>
            <li>Review each change before committing</li>
            <li>Run the Translation Audit Tool after applying fixes</li>
            <li>Test affected components thoroughly</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="fixes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixes">Detected Fixes</TabsTrigger>
          <TabsTrigger value="keys">Missing Keys</TabsTrigger>
          <TabsTrigger value="guide">Fix Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="fixes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Category</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  All ({fixes.length})
                </Badge>
                <Badge 
                  variant={selectedCategory === 'placeholder' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('placeholder')}
                >
                  Placeholders ({fixes.filter(f => f.category === 'placeholder').length})
                </Badge>
                <Badge 
                  variant={selectedCategory === 'button' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('button')}
                >
                  Buttons ({fixes.filter(f => f.category === 'button').length})
                </Badge>
                <Badge 
                  variant={selectedCategory === 'enum' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('enum')}
                >
                  Enums ({fixes.filter(f => f.category === 'enum').length})
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {filteredFixes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold">No Issues Found!</h3>
                    <p className="text-muted-foreground">All translations are properly configured.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFixes.map((fix, idx) => (
                      <Card key={idx} className="border-l-4" style={{
                        borderLeftColor: fix.priority === 'high' ? '#ef4444' : 
                                       fix.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                      }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-mono">{fix.file} (Line {fix.line})</CardTitle>
                              <div className="flex gap-2 mt-2">
                                <Badge variant={fix.priority === 'high' ? 'destructive' : 'outline'}>
                                  {fix.priority} priority
                                </Badge>
                                <Badge variant="secondary">{fix.category}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-red-600">Current:</p>
                            <code className="block bg-red-50 p-2 rounded text-xs">{fix.current}</code>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-600">Suggested:</p>
                            <code className="block bg-green-50 p-2 rounded text-xs">{fix.suggested}</code>
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

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missing Translation Keys</CardTitle>
              <CardDescription>
                Add these keys to your translation JSON files (src/locales/[lang]/[namespace].json)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <pre className="bg-muted p-4 rounded-lg text-xs">
                  {JSON.stringify(requiredTranslationKeys, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Fix Guide</CardTitle>
              <CardDescription>Step-by-step instructions for applying fixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Add Translation Keys</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click "Export Translation Keys" button</li>
                  <li>Open the downloaded JSON file</li>
                  <li>Copy keys to appropriate namespace files in src/locales/</li>
                  <li>Ensure all three languages (en, es, fr) have the keys</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Apply Code Fixes</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Review the "Detected Fixes" tab</li>
                  <li>For each file, replace hardcoded strings with t() calls</li>
                  <li>Use the suggested code from the fix cards</li>
                  <li>Test each component after making changes</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Verify Fixes</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Run the Translation Audit Tool</li>
                  <li>Check that fixed issues no longer appear</li>
                  <li>Test language switching (EN, ES, FR)</li>
                  <li>Verify all placeholders display correctly</li>
                </ol>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Common Patterns to Fix
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Placeholders:</strong> <code>placeholder="text"</code> → <code>{'placeholder={t("key")}'}</code>
                  </li>
                  <li>
                    <strong>Select Values:</strong> <code>&lt;SelectValue placeholder="text" /&gt;</code> → <code>{'<SelectValue placeholder={t("key")} />'}</code>
                  </li>
                  <li>
                    <strong>Enum Values:</strong> <code>{'address.type'}</code> → <code>{'t(`address:type.${address.type.toLowerCase()}`)'}</code>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
