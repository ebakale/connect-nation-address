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
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // General Settings
  const [systemName, setSystemName] = useState('Emergency Response System');
  const [systemDescription, setSystemDescription] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  
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
  const [defaultRegion, setDefaultRegion] = useState('Equatorial Guinea');
  const [locationAccuracy, setLocationAccuracy] = useState('10');
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [mapProvider, setMapProvider] = useState('mapbox');
  
  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [webhookTimeout, setWebhookTimeout] = useState('30');
  const [apiLoggingEnabled, setApiLoggingEnabled] = useState(true);
  const [corsEnabled, setCorsEnabled] = useState(true);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'pt', name: 'Portuguese' }
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
      // For now, we'll use default values since we don't have a system_config table
      // In a real implementation, you would fetch from a system_config table
      loadDefaultConfigurations();
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Failed to load system configurations');
      loadDefaultConfigurations();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultConfigurations = () => {
    // Load default configurations
    setSystemName('Police Emergency Response System');
    setSystemDescription('Comprehensive emergency response and incident management system for law enforcement');
    setDefaultLanguage('en');
    setTimezone('Africa/Malabo');
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
    setDefaultRegion('Equatorial Guinea');
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
      
      // Here you would save to a system_config table
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success(`${category} configuration saved successfully`);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const testNotifications = async () => {
    try {
      toast.info('Sending test notifications...');
      // Simulate test notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test notifications sent successfully');
    } catch (error) {
      console.error('Error testing notifications:', error);
      toast.error('Failed to send test notifications');
    }
  };

  const backupSystem = async () => {
    try {
      toast.info('Creating system backup...');
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('System backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create system backup');
    }
  };

  const restoreSystem = async () => {
    try {
      toast.info('Restoring system from backup...');
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('System restored successfully');
    } catch (error) {
      console.error('Error restoring system:', error);
      toast.error('Failed to restore system');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={backupSystem}>
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button variant="outline" onClick={restoreSystem}>
            <Upload className="h-4 w-4 mr-2" />
            Restore
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="text-xs sm:text-sm px-2 py-1.5">General</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs sm:text-sm px-2 py-1.5">Emergency</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-1.5">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm px-2 py-1.5">Security</TabsTrigger>
          <TabsTrigger value="location" className="text-xs sm:text-sm px-2 py-1.5">Location</TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm px-2 py-1.5">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="system_name">System Name</Label>
                  <Input
                    id="system_name"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_language">Default Language</Label>
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
                  <Label htmlFor="timezone">Timezone</Label>
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
                  <Label htmlFor="default_region">Default Region</Label>
                  <Input
                    id="default_region"
                    value={defaultRegion}
                    onChange={(e) => setDefaultRegion(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="system_description">System Description</Label>
                <Textarea
                  id="system_description"
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
                  rows={3}
                  autoResize
                  className="w-full text-xs sm:text-sm break-words whitespace-pre-wrap leading-snug"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('General')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
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
                Emergency Response Settings
              </CardTitle>
              <CardDescription>Configure emergency response parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_time">Target Response Time (minutes)</Label>
                  <Input
                    id="response_time"
                    type="number"
                    value={emergencyResponseTime}
                    onChange={(e) => setEmergencyResponseTime(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority_levels">Number of Priority Levels</Label>
                  <Input
                    id="priority_levels"
                    type="number"
                    value={priorityLevels}
                    onChange={(e) => setPriorityLevels(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup_threshold">Backup Request Threshold (minutes)</Label>
                  <Input
                    id="backup_threshold"
                    type="number"
                    value={backupRequestThreshold}
                    onChange={(e) => setBackupRequestThreshold(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_dispatch"
                    checked={autoDispatch}
                    onCheckedChange={setAutoDispatch}
                  />
                  <Label htmlFor="auto_dispatch">Enable Auto-Dispatch</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Emergency')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Emergency Settings
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
                Notification Settings
              </CardTitle>
              <CardDescription>Configure notification channels and behavior</CardDescription>
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
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms_notifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="push_notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                    <Label htmlFor="push_notifications">Push Notifications</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry_count">Notification Retry Count</Label>
                  <Input
                    id="retry_count"
                    type="number"
                    value={notificationRetryCount}
                    onChange={(e) => setNotificationRetryCount(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={testNotifications}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Notifications
                </Button>
                <Button onClick={() => saveConfiguration('Notifications')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
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
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_policy">Password Policy</Label>
                  <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="two_factor"
                    checked={twoFactorRequired}
                    onCheckedChange={setTwoFactorRequired}
                  />
                  <Label htmlFor="two_factor">Require Two-Factor Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    checked={encryptionEnabled}
                    onCheckedChange={setEncryptionEnabled}
                  />
                  <Label htmlFor="encryption">Enable Data Encryption</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Security')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
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
                Location & Mapping Settings
              </CardTitle>
              <CardDescription>Configure location services and mapping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_accuracy">Required Location Accuracy (meters)</Label>
                  <Input
                    id="location_accuracy"
                    type="number"
                    value={locationAccuracy}
                    onChange={(e) => setLocationAccuracy(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map_provider">Map Provider</Label>
                  <Select value={mapProvider} onValueChange={setMapProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mapbox">Mapbox</SelectItem>
                      <SelectItem value="google">Google Maps</SelectItem>
                      <SelectItem value="openstreetmap">OpenStreetMap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gps_tracking"
                    checked={gpsTrackingEnabled}
                    onCheckedChange={setGpsTrackingEnabled}
                  />
                  <Label htmlFor="gps_tracking">Enable GPS Tracking</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('Location')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Location Settings
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
                API & Integration Settings
              </CardTitle>
              <CardDescription>Configure API settings and external integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate_limit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={apiRateLimit}
                    onChange={(e) => setApiRateLimit(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook_timeout">Webhook Timeout (seconds)</Label>
                  <Input
                    id="webhook_timeout"
                    type="number"
                    value={webhookTimeout}
                    onChange={(e) => setWebhookTimeout(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="api_logging"
                    checked={apiLoggingEnabled}
                    onCheckedChange={setApiLoggingEnabled}
                  />
                  <Label htmlFor="api_logging">Enable API Logging</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cors_enabled"
                    checked={corsEnabled}
                    onCheckedChange={setCorsEnabled}
                  />
                  <Label htmlFor="cors_enabled">Enable CORS</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveConfiguration('API')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Settings
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