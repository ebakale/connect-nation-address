import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const PostalReports = () => {
  const { t } = useTranslation('postal');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('reports.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground">{t('reports.deliveryMetrics')}</p>
      </CardContent>
    </Card>
  );
};
