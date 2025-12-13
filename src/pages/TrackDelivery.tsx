import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryTrackingResult } from '@/components/postal/DeliveryTrackingResult';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackingData {
  order_number: string;
  status: string;
  recipient_name: string;
  package_type: string;
  created_at: string;
  scheduled_date: string | null;
  completed_at: string | null;
  status_logs: Array<{
    status: string;
    changed_at: string;
  }>;
  proof?: {
    proof_type: string;
    photo_url: string | null;
    received_by_name: string | null;
    captured_at: string;
  };
}

const TrackDelivery: React.FC = () => {
  const { t, i18n } = useTranslation('postal');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast.error(t('tracking.enterTrackingNumber'));
      return;
    }

    setLoading(true);
    setNotFound(false);
    setTrackingData(null);

    try {
      const { data, error } = await supabase.functions.invoke('track-delivery', {
        body: {
          order_number: trackingNumber.trim().toUpperCase(),
          phone: phoneNumber.trim() || undefined
        }
      });

      if (error) throw error;

      if (data.success && data.order) {
        setTrackingData(data.order);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      toast.error(t('tracking.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setTrackingData(null);
    setNotFound(false);
    setTrackingNumber('');
    setPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-background" key={i18n.resolvedLanguage}>
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('tracking.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('tracking.subtitle')}</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('tracking.backToHome')}
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!trackingData ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                {t('tracking.searchTitle')}
              </CardTitle>
              <CardDescription>
                {t('tracking.searchDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('tracking.trackingNumber')} *
                  </label>
                  <Input
                    placeholder={t('tracking.trackingNumberPlaceholder')}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="text-center text-lg font-mono uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('tracking.phoneOptional')}
                  </label>
                  <Input
                    type="tel"
                    placeholder={t('tracking.phonePlaceholder')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('tracking.phoneHint')}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>{t('tracking.searching')}...</>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {t('tracking.trackButton')}
                    </>
                  )}
                </Button>
              </form>

              {notFound && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <p className="text-destructive font-medium">
                    {t('tracking.notFound')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('tracking.notFoundHint')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <DeliveryTrackingResult 
            data={trackingData} 
            onNewSearch={handleNewSearch}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>{t('tracking.footer')}</p>
        </div>
      </footer>
    </div>
  );
};

export default TrackDelivery;
