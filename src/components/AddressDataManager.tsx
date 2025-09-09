import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleMapsImporter } from "@/components/GoogleMapsImporter";
import { AddressExporter } from "@/components/AddressExporter";
import { Import, Download } from "lucide-react";
import { useTranslation } from 'react-i18next';

export function AddressDataManager() {
  const { t } = useTranslation('address');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('addressDataManagement')}</h2>
        <p className="text-muted-foreground">
          {t('importExportAddresses')}
        </p>
      </div>

      <Separator />

      {/* Google Maps Importer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Import className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('importAddresses')}</h3>
        </div>
        <GoogleMapsImporter />
      </div>

      <Separator />

      {/* Address Exporter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('exportAddresses')}</h3>
        </div>
        <AddressExporter />
      </div>
    </div>
  );
}