import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { 
  Bell, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  Radio
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority_level: number;
  read: boolean;
  created_at: string;
  metadata?: any;
}

const NotificationTester: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Test form state
  const [emergencyType, setEmergencyType] = useState('theft');
  const [priority, setPriority] = useState(3);
  const [message, setMessage] = useState('Test emergency alert from notification tester');
  const [latitude, setLatitude] = useState('3.7439');
  const [longitude, setLongitude] = useState('8.7763');
  const [contactInfo, setContactInfo] = useState('+240555123456');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  const testEmergencyAlert = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-emergency-alert', {
        body: {
          message,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          emergencyType,
          reporterId: user?.id,
          contactInfo,
          language: 'en'
        }
      });

      if (error) throw error;

      const result = {
        test: 'Emergency Alert Processing',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast.success('Emergency alert test completed successfully!');
      
      // Refresh notifications after a short delay
      setTimeout(fetchNotifications, 2000);
    } catch (error) {
      console.error('Emergency alert test failed:', error);
      const result = {
        test: 'Emergency Alert Processing',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast.error('Emergency alert test failed');
    } finally {
      setLoading(false);
    }
  };

  const testCreateNotification = async () => {
    setLoading(true);
    try {
      // Create a test notification directly
      const { data, error } = await supabase
        .from('emergency_notifications')
        .insert({
          user_id: user?.id,
          title: `Test Notification - ${emergencyType.toUpperCase()}`,
          message: message,
          type: 'test_notification',
          priority_level: priority,
          read: false,
          metadata: {
            test_type: 'manual_test',
            emergency_type: emergencyType,
            location: `${latitude}, ${longitude}`,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      const result = {
        test: 'Create Notification',
        success: true,
        data,
        notificationId: data.id,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast.success('Test notification created successfully!');
      
      // Refresh notifications immediately
      setTimeout(fetchNotifications, 500);
    } catch (error) {
      console.error('Create notification test failed:', error);
      const result = {
        test: 'Create Notification',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast.error('Create notification test failed');
    } finally {
      setLoading(false);
    }
  };

  const testSMSFallback = async () => {
    setLoading(true);
    try {
      // Add SMS to fallback queue
      const { data, error } = await supabase
        .from('sms_fallback_queue')
        .insert({
          phone_number: contactInfo,
          message_content: `TEST SMS: ${message}`,
          priority: priority,
          location_data: `${latitude}, ${longitude}`,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const result = {
        test: 'SMS Fallback Queue',
        success: true,
        data,
        smsId: data.id,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast.success('SMS queued successfully!');
    } catch (error) {
      console.error('SMS fallback test failed:', error);
      const result = {
        test: 'SMS Fallback Queue',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast.error('SMS fallback test failed');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    toast('Test results cleared');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Info';
      default: return 'Unknown';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Tester
          </CardTitle>
          <CardDescription>Please log in to test notifications</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Tester
          </CardTitle>
          <CardDescription>
            Test different types of notifications in the emergency response system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="emergency-type">Emergency Type</Label>
                <Select value={emergencyType} onValueChange={setEmergencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="accident">Traffic Accident</SelectItem>
                    <SelectItem value="domestic">Domestic Violence</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Critical</SelectItem>
                    <SelectItem value="2">2 - High</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - Low</SelectItem>
                    <SelectItem value="5">5 - Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Test emergency message"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="3.7439"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="8.7763"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact">Contact Info</Label>
                <Input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="+240555123456"
                />
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testEmergencyAlert}
              disabled={loading}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <AlertTriangle className="h-4 w-4" />
              Test Emergency Alert
            </Button>

            <Button
              onClick={testCreateNotification}
              disabled={loading}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Bell className="h-4 w-4" />
              Create Test Notification
            </Button>

            <Button
              onClick={testSMSFallback}
              disabled={loading}
              className="flex items-center gap-2"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Test SMS Queue
            </Button>

            <Button
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Bell className="h-4 w-4" />
              Refresh Notifications
            </Button>

            {testResults.length > 0 && (
              <Button
                onClick={clearTestResults}
                variant="ghost"
                className="flex items-center gap-2"
              >
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.test}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="text-sm space-y-1">
                      {result.notificationId && (
                        <p className="text-green-700">Notification ID: {result.notificationId}</p>
                      )}
                      {result.smsId && (
                        <p className="text-green-700">SMS ID: {result.smsId}</p>
                      )}
                      <div className="text-green-600 text-xs">
                        <strong>Response:</strong>
                        <pre className="mt-1 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600">✗ {result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Notifications ({notifications.length})
          </CardTitle>
          <CardDescription>
            Recent notifications for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No notifications found. Try running a test to generate notifications.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(notification.priority_level)}
                        >
                          {getPriorityText(notification.priority_level)}
                        </Badge>
                        <Badge variant="secondary">{notification.type}</Badge>
                        {!notification.read && (
                          <Badge variant="default">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                  {notification.metadata && (
                    <div className="mt-3 p-2 bg-white rounded border text-xs">
                      <strong>Metadata:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(notification.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;