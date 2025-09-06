import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: boolean;
  totalImported?: number;
  successCount?: number;
  errorCount?: number;
  details?: Array<{
    name: string;
    uac?: string;
    status: string;
    city?: string;
    region?: string;
    error?: string;
  }>;
  message?: string;
  error?: string;
}

export function GoogleMapsImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleImportAddresses = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);

      toast({
        title: "Starting Import",
        description: "Fetching verified addresses from Google Maps for Equatorial Guinea...",
      });

      const { data, error } = await supabase.functions.invoke('import-google-maps-addresses');

      if (error) {
        throw error;
      }

      setImportResult(data);

      if (data.success) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${data.successCount} addresses with ${data.errorCount} errors.`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.message || 'Failed to import addresses';
      
      setImportResult({
        success: false,
        error: errorMessage
      });

      toast({
        title: "Import Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Google Maps Address Importer
        </CardTitle>
        <CardDescription>
          Import verified addresses from Google Maps for Equatorial Guinea and format them with UAC codes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will fetch verified locations from Google Maps including government buildings, 
            landmarks, hospitals, schools, hotels, and other important places across Equatorial Guinea. 
            Each address will be assigned a proper UAC code according to your system format.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button 
            onClick={handleImportAddresses}
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing Addresses...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Google Maps Addresses
              </>
            )}
          </Button>

          {importResult && (
            <div className="space-y-4">
              {importResult.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="font-semibold mb-2">Import Successful!</div>
                    <div className="space-y-1 text-sm">
                      <p>• Total Imported: {importResult.totalImported}</p>
                      <p>• Successful: {importResult.successCount}</p>
                      <p>• Errors: {importResult.errorCount}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Import Failed</div>
                    <p>{importResult.error}</p>
                  </AlertDescription>
                </Alert>
              )}

              {importResult.details && importResult.details.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {importResult.details.slice(0, 20).map((detail, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded border text-sm ${
                            detail.status === 'success' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{detail.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              detail.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {detail.status}
                            </span>
                          </div>
                          {detail.uac && (
                            <div className="text-xs text-gray-600 mt-1">
                              UAC: {detail.uac} • {detail.city}, {detail.region}
                            </div>
                          )}
                          {detail.error && (
                            <div className="text-xs text-red-600 mt-1">
                              Error: {detail.error}
                            </div>
                          )}
                        </div>
                      ))}
                      {importResult.details.length > 20 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          ... and {importResult.details.length - 20} more items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}