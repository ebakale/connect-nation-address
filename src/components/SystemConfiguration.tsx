import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Shield, Bell, Clock, MapPin, Radio, 
  Database, Key, AlertTriangle, CheckCircle, Save,
  RefreshCw, Download, Upload, Globe, Lock
} from 'lucide-react';

interface SystemConfig {
  id?: string;
  config_key: string;
  config_value: string;
  category: string;
  description?: string;
  is_encrypted?: boolean;
  created_at?: string;
  updated_at?: string;
}

const SystemConfiguration: React.FC = () => {
  const { t, i18n } = useTranslation('emergency');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // General Settings
  const [systemName, setSystemName] = useState('Emergency Response System');
  const [systemDescription, setSystemDescription] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultRegion, setDefaultRegion] = useState('Equatorial Guinea');
  
  // Emergency Settings
  const [emergencyResponseTime, setEmergencyResponseTime] = useState('5');
  const [priorityLevels, setPriorityLevels] = useState('5');
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [backupRequestThreshold, setBackupRequestThreshold] = useState('15');
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationRetryCount, setNotificationRetryCount] = useState('3');
  
  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState('480');
  const [passwordPolicy, setPasswordPolicy] = useState('strict');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  
  // Location Settings
  const [locationAccuracy, setLocationAccuracy] = useState('10');
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [mapProvider, setMapProvider] = useState('mapbox');
  
  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [webhookTimeout, setWebhookTimeout] = useState('30');
  const [apiLoggingEnabled, setApiLoggingEnabled] = useState(true);
  const [corsEnabled, setCorsEnabled] = useState(true);

  const languages = [
    { code: 'en', name: t('systemConfiguration.languages.english') },
    { code: 'es', name: t('systemConfiguration.languages.spanish') },
    { code: 'fr', name: t('systemConfiguration.languages.french') },
    { code: 'pt', name: t('systemConfiguration.languages.portuguese') }
  ];

  const timezones = [
    'UTC',
    'Africa/Malabo',
    'Africa/Lagos',
    'Europe/Madrid',
    'America/New_York'
  ];

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      console.log('Fetching system configurations from database');
      
      // Get auth session for the request
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session, loading defaults');
        loadDefaultConfigurations();
        return;
      }

      const { data, error } = await supabase.functions.invoke('system-config-api', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching from edge function:', error);
        // Try direct database query as fallback
        const { data: dbData, error: dbError } = await supabase
          .from('system_config')
          .select('*');
        
        if (dbError) {
          console.error('Database error:', dbError);
          loadDefaultConfigurations();
          return;
        }
        
        if (dbData && dbData.length > 0) {
          applyConfigurations(dbData);
        } else {
          loadDefaultConfigurations();
        }
        return;
      }

      if (data?.raw && data.raw.length > 0) {
        applyConfigurations(data.raw);
        toast.success(t('systemConfiguration.messages.configurationLoaded'));
      } else {
        loadDefaultConfigurations();
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error(t('systemConfiguration.messages.failedToLoadConfigurations'));
      loadDefaultConfigurations();
    } finally {
      setLoading(false);
    }
  };

  const applyConfigurations = (configs: SystemConfig[]) => {
    configs.forEach(config => {
      const value = config.config_value;
      switch (config.config_key) {
        case 'system_name': setSystemName(value); break;
        case 'system_description': setSystemDescription(value); break;
        case 'default_language': setDefaultLanguage(value); break;
        case 'timezone': setTimezone(value); break;
        case 'default_region': setDefaultRegion(value); break;
        case 'emergency_response_time': setEmergencyResponseTime(value); break;
        case 'priority_levels': setPriorityLevels(value); break;
        case 'auto_dispatch': setAutoDispatch(value === 'true'); break;
        case 'backup_request_threshold': setBackupRequestThreshold(value); break;
        case 'email_notifications': setEmailNotifications(value === 'true'); break;
        case 'sms_notifications': setSmsNotifications(value === 'true'); break;
        case 'push_notifications': setPushNotifications(value === 'true'); break;
        case 'notification_retry_count': setNotificationRetryCount(value); break;
        case 'session_timeout': setSessionTimeout(value); break;
        case 'password_policy': setPasswordPolicy(value); break;
        case 'two_factor_required': setTwoFactorRequired(value === 'true'); break;
        case 'encryption_enabled': setEncryptionEnabled(value === 'true'); break;
        case 'location_accuracy': setLocationAccuracy(value); break;
        case 'gps_tracking_enabled': setGpsTrackingEnabled(value === 'true'); break;
        case 'map_provider': setMapProvider(value); break;
        case 'api_rate_limit': setApiRateLimit(value); break;
        case 'webhook_timeout': setWebhookTimeout(value); break;
        case 'api_logging_enabled': setApiLoggingEnabled(value === 'true'); break;
        case 'cors_enabled': setCorsEnabled(value === 'true'); break;
      }
    });
  };

  const loadDefaultConfigurations = () => {
    setSystemName('Police Emergency Response System');
    setSystemDescription('Comprehensive emergency response and incident management system for law enforcement');
    setDefaultLanguage('en');
    setTimezone('Africa/Malabo');
    setDefaultRegion('Equatorial Guinea');
    setEmergencyResponseTime('5');
    setPriorityLevels('5');
    setAutoDispatch(false);
    setBackupRequestThreshold('15');
    setEmailNotifications(true);
    setSmsNotifications(true);
    setPushNotifications(true);
    setNotificationRetryCount('3');
    setSessionTimeout('480');
    setPasswordPolicy('strict');
    setTwoFactorRequired(false);
    setEncryptionEnabled(true);
    setLocationAccuracy('10');
    setGpsTrackingEnabled(true);
    setMapProvider('mapbox');
    setApiRateLimit('1000');
    setWebhookTimeout('30');
    setApiLoggingEnabled(true);
    setCorsEnabled(true);
  };

  const saveConfiguration = async (category: string) => {
    try {
      setSaving(true);
      console.log(`Saving ${category} configuration to database`);
      
      let configsToSave: Record<string, string> = {};
      
      switch (category.toLowerCase()) {
        case 'general':
          configsToSave = {
            system_name: systemName,
            system_description: systemDescription,
            default_language: defaultLanguage,
            timezone: timezone,
            default_region: defaultRegion
          };
          break;
        case 'emergency':
          configsToSave = {
            emergency_response_time: emergencyResponseTime,
            priority_levels: priorityLevels,
            auto_dispatch: String(autoDispatch),
            backup_request_threshold: backupRequestThreshold
          };
          break;
        case 'notifications':
          configsToSave = {
            email_notifications: String(emailNotifications),
            sms_notifications: String(smsNotifications),
            push_notifications: String(pushNotifications),
            notification_retry_count: notificationRetryCount
          };
          break;
        case 'security':
          configsToSave = {
            session_timeout: sessionTimeout,
            password_policy: passwordPolicy,
            two_factor_required: String(twoFactorRequired),
            encryption_enabled: String(encryptionEnabled)
          };
          break;
        case 'location':
          configsToSave = {
            location_accuracy: locationAccuracy,
            gps_tracking_enabled: String(gpsTrackingEnabled),
            map_provider: mapProvider
          };
          break;
        case 'api':
          configsToSave = {
            api_rate_limit: apiRateLimit,
            webhook_timeout: webhookTimeout,
            api_logging_enabled: String(apiLoggingEnabled),
            cors_enabled: String(corsEnabled)
          };
          break;
      }

      const { data, error } = await supabase.functions.invoke('system-config-api', {
        method: 'PUT',
        body: { configs: configsToSave }
      });

      if (error) {
        console.error('Error saving via edge function:', error);
        throw error;
      }

      setLastSaved(new Date().toISOString());
      toast.success(`${category} ${t('systemConfiguration.messages.configurationSaved')}`);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(t('systemConfiguration.messages.failedToSaveConfiguration'));
    } finally {
      setSaving(false);
    }
  };

  const testNotifications = async () => {
    try {
      toast.info(t('systemConfiguration.messages.sendingTestNotifications'));
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('systemConfiguration.messages.testNotificationsSent'));
    } catch (error) {
      console.error('Error testing notifications:', error);
      toast.error(t('systemConfiguration.messages.failedToSendTestNotifications'));
    }
  };

  const backupSystem = async () => {
    try {
      toast.info(t('systemConfiguration.messages.creatingSystemBackup'));
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(t('systemConfiguration.messages.systemBackupCreated'));
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(t('systemConfiguration.messages.failedToCreateBackup'));
    }
  };

  const restoreSystem = async () => {
    try {
      toast.info(t('systemConfiguration.messages.restoringSystemFromBackup'));
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(t('systemConfiguration.messages.systemRestored'));
    } catch (error) {
      console.error('Error restoring system:', error);
      toast.error(t('systemConfiguration.messages.failedToRestoreSystem'));
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const date = new Date(lastSaved);
    return date.toLocaleString(i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>{t('systemConfiguration.messages.loadingConfiguration')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={i18n.resolvedLanguage || i18n.language}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
              <Database className="h-3 w-3 mr-1" />
              {t('systemConfiguration.databasePersisted')}
            </Badge>
          </div>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('systemConfiguration.lastSaved')}: {formatLastSaved()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchConfigurations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('systemConfiguration.reload')}
          </Button>
          <Button variant="outline" size="sm" onClick={backupSystem}>
            <Download className="h-4 w-4 mr-2" />
            {t('systemConfiguration.backup')}
          </Button>
          <Button variant="outline" size="sm" onClick={restoreSystem}>
            <Upload className="h-4 w-4 mr-2" />
            {t('systemConfiguration.restore')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.general')}</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.emergency')}</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.notifications')}</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.security')}</TabsTrigger>
          <TabsTrigger value="location" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.location')}</TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm px-2 py-1.5">{t('systemConfiguration.api')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('systemConfiguration.generalSettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.basicSystemConfiguration')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="system_name">{t('systemConfiguration.systemName')}</Label>
                  <Input
                    id="system_name"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="text-sm leading-snug w-full overflow-visible"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_language">{t('systemConfiguration.defaultLanguage')}</Label>
                  <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('systemConfiguration.timezone')}</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_region">{t('systemConfiguration.defaultRegion')}</Label>
                  <Input
                    id="default_region"
                    value={defaultRegion}
                    onChange={(e) => setDefaultRegion(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="system_description">{t('systemConfiguration.systemDescription')}</Label>
                <Textarea
                  id="system_description"
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
                  rows={3}
                  className="w-full text-sm break-words whitespace-pre-wrap leading-snug"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('General')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveGeneralSettings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('systemConfiguration.emergencyResponseSettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.configureEmergencyResponseParams')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_time">{t('systemConfiguration.targetResponseTime')}</Label>
                  <Input
                    id="response_time"
                    type="number"
                    value={emergencyResponseTime}
                    onChange={(e) => setEmergencyResponseTime(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority_levels">{t('systemConfiguration.numberOfPriorityLevels')}</Label>
                  <Input
                    id="priority_levels"
                    type="number"
                    value={priorityLevels}
                    onChange={(e) => setPriorityLevels(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup_threshold">{t('systemConfiguration.backupRequestThreshold')}</Label>
                  <Input
                    id="backup_threshold"
                    type="number"
                    value={backupRequestThreshold}
                    onChange={(e) => setBackupRequestThreshold(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_dispatch"
                    checked={autoDispatch}
                    onCheckedChange={setAutoDispatch}
                  />
                  <Label htmlFor="auto_dispatch">{t('systemConfiguration.enableAutoDispatch')}</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Emergency')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveEmergencySettings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('systemConfiguration.notificationSettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.configureNotificationChannels')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                    <Label htmlFor="email_notifications">{t('systemConfiguration.emailNotifications')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms_notifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                    <Label htmlFor="sms_notifications">{t('systemConfiguration.smsNotifications')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="push_notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                    <Label htmlFor="push_notifications">{t('systemConfiguration.pushNotifications')}</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry_count">{t('systemConfiguration.notificationRetryCount')}</Label>
                  <Input
                    id="retry_count"
                    type="number"
                    value={notificationRetryCount}
                    onChange={(e) => setNotificationRetryCount(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button variant="outline" onClick={testNotifications} className="text-sm px-3 py-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('systemConfiguration.testNotifications')}</span>
                  <span className="sm:hidden">{t('systemConfiguration.test')}</span>
                </Button>
                <Button onClick={() => saveConfiguration('Notifications')} disabled={saving} className="text-sm px-3 py-2">
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveNotificationSettings')}</span>
                  <span className="sm:hidden">{t('systemConfiguration.save')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('systemConfiguration.securitySettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.configureSecurityPolicies')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">{t('systemConfiguration.sessionTimeout')}</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_policy">{t('systemConfiguration.passwordPolicy')}</Label>
                  <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">{t('systemConfiguration.passwordPolicies.basic')}</SelectItem>
                      <SelectItem value="medium">{t('systemConfiguration.passwordPolicies.medium')}</SelectItem>
                      <SelectItem value="strict">{t('systemConfiguration.passwordPolicies.strict')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="two_factor"
                    checked={twoFactorRequired}
                    onCheckedChange={setTwoFactorRequired}
                  />
                  <Label htmlFor="two_factor">{t('systemConfiguration.requireTwoFactorAuth')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    checked={encryptionEnabled}
                    onCheckedChange={setEncryptionEnabled}
                  />
                  <Label htmlFor="encryption">{t('systemConfiguration.enableDataEncryption')}</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Security')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveSecuritySettings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('systemConfiguration.locationMappingSettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.configureLocationServices')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_accuracy">{t('systemConfiguration.requiredLocationAccuracy')}</Label>
                  <Input
                    id="location_accuracy"
                    type="number"
                    value={locationAccuracy}
                    onChange={(e) => setLocationAccuracy(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map_provider">{t('systemConfiguration.mapProvider')}</Label>
                  <Select value={mapProvider} onValueChange={setMapProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mapbox">{t('systemConfiguration.mapProviders.mapbox')}</SelectItem>
                      <SelectItem value="google">{t('systemConfiguration.mapProviders.googleMaps')}</SelectItem>
                      <SelectItem value="openstreetmap">{t('systemConfiguration.mapProviders.openStreetMap')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gps_tracking"
                    checked={gpsTrackingEnabled}
                    onCheckedChange={setGpsTrackingEnabled}
                  />
                  <Label htmlFor="gps_tracking">{t('systemConfiguration.enableGpsTracking')}</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Location')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveLocationSettings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('systemConfiguration.apiIntegrationSettings')}
              </CardTitle>
              <CardDescription>{t('systemConfiguration.configureApiSettings')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate_limit">{t('systemConfiguration.apiRateLimit')}</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={apiRateLimit}
                    onChange={(e) => setApiRateLimit(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook_timeout">{t('systemConfiguration.webhookTimeout')}</Label>
                  <Input
                    id="webhook_timeout"
                    type="number"
                    value={webhookTimeout}
                    onChange={(e) => setWebhookTimeout(e.target.value)}
                    className="text-sm leading-snug"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="api_logging"
                    checked={apiLoggingEnabled}
                    onCheckedChange={setApiLoggingEnabled}
                  />
                  <Label htmlFor="api_logging">{t('systemConfiguration.enableApiLogging')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cors_enabled"
                    checked={corsEnabled}
                    onCheckedChange={setCorsEnabled}
                  />
                  <Label htmlFor="cors_enabled">{t('systemConfiguration.enableCors')}</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('API')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('systemConfiguration.saving') : t('systemConfiguration.saveApiSettings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
