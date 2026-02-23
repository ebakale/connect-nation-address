import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Package, ArrowLeft, Shield, Clock, Info, Phone, HelpCircle, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeliveryTrackingResult } from '@/components/postal/DeliveryTrackingResult';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackingData {
  order_number: string;
  status: string;
  recipient_name: string;
  recipient_address_uac: string;
  package_type: string;
  created_at: string;
  scheduled_date: string | null;
  completed_at: string | null;
  sender_name: string;
  sender_address_uac?: string | null;
  weight_grams?: number | null;
  dimensions_cm?: string | null;
  declared_value?: number | null;
  priority_level?: number;
  requires_signature?: boolean;
  requires_id_verification?: boolean;
  preferred_time_window?: string | null;
  special_instructions?: string | null;
  cod_required?: boolean;
  cod_amount?: number | null;
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

const EXAMPLE_TRACKING = 'DEL-20241213-A1B2';

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
    <div className="min-h-screen bg-background flex flex-col" key={i18n.resolvedLanguage}>
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{t('tracking.title')}</h1>
                <Badge variant="secondary" className="text-xs tracking-wider uppercase">
                  {t('tracking.postalService', { defaultValue: 'Postal Service' })}
                </Badge>
              </div>
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

      {/* Quick Info Bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{t('tracking.serviceHours', { defaultValue: 'Service: Mon-Sat, 8AM-6PM' })}</span>
          </div>
          <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span>{t('tracking.formatHint', { defaultValue: 'Format: DEL-YYYYMMDD-XXXX' })}</span>
          </div>
          <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>{t('tracking.secureTracking', { defaultValue: 'Encrypted & Secure' })}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        {!trackingData ? (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Search Card */}
            <Card>
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  {t('tracking.searchTitle')}
                </CardTitle>
                <CardDescription>
                  {t('tracking.searchDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrack} className="space-y-4">
                  {/* Tracking Number Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('tracking.trackingNumber')} *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('tracking.trackingNumberPlaceholder')}
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="pl-10 text-center text-lg font-mono uppercase"
                      />
                    </div>
                    {/* Example Chip */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{t('tracking.example', { defaultValue: 'Example:' })}</span>
                      <button
                        type="button"
                        onClick={() => setTrackingNumber(EXAMPLE_TRACKING)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted hover:bg-muted/80 rounded text-xs font-mono text-muted-foreground transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {EXAMPLE_TRACKING}
                      </button>
                    </div>
                  </div>

                  {/* Phone Verification */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('tracking.phoneOptional')}
                      </label>
                      <div className="group relative">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border">
                          {t('tracking.phoneTooltip', { defaultValue: 'Last 4 digits verify your identity' })}
                        </div>
                      </div>
                    </div>
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

                {/* Not Found State */}
                {notFound && (
                  <div className="mt-6 p-5 bg-destructive/5 border border-destructive/20 rounded-lg text-center space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-destructive font-semibold">
                        {t('tracking.notFound')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('tracking.notFoundHint')}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{t('tracking.notFoundTip1', { defaultValue: '• Double-check your tracking number for typos' })}</p>
                      <p>{t('tracking.notFoundTip2', { defaultValue: '• Ensure the format matches: DEL-YYYYMMDD-XXXX' })}</p>
                      <p>{t('tracking.notFoundTip3', { defaultValue: '• Contact your local post office for assistance' })}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Empty State (only when no search has been performed and no error) */}
            {!notFound && (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('tracking.emptyStateTitle', { defaultValue: 'Enter your tracking number above' })}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">
                    {t('tracking.emptyStateDesc', { defaultValue: 'Track letters, parcels, and packages sent through the Government Postal Service' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <DeliveryTrackingResult 
            data={trackingData} 
            onNewSearch={handleNewSearch}
          />
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{t('tracking.footer')}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{t('tracking.supportPhone', { defaultValue: 'Support: +240 333 000 000' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <Link to="/" className="hover:text-foreground transition-colors underline underline-offset-2">
                  {t('tracking.needHelp', { defaultValue: 'Need help?' })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackDelivery;
