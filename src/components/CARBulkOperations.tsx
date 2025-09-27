import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, CheckCircle, AlertTriangle, Clock, 
  Play, Square, RefreshCw, Download, Upload,
  Users, MapPin, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface BulkOperation {
  id: string;
  type: 'auto_verify' | 'merge_duplicates' | 'update_status' | 'export_data';
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  total: number;
  processed: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export function CARBulkOperations() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin']);
  
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);

  const startAutoVerification = async () => {
    try {
      setLoading(true);
      
      const operationId = crypto.randomUUID();
      const newOperation: BulkOperation = {
        id: operationId,
        type: 'auto_verify',
        status: 'running',
        progress: 0,
        total: 0,
        processed: 0,
        startedAt: new Date()
      };
      
      setOperations(prev => [...prev, newOperation]);
      
      // Call the auto-approval function
      const { error } = await supabase.rpc('auto_approve_verified_citizen_addresses');
      
      if (error) throw error;
      
      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100, completedAt: new Date() }
          : op
      ));
      
      toast({
        title: "Success",
        description: "Auto-verification process completed"
      });
    } catch (error) {
      console.error('Error starting auto-verification:', error);
      toast({
        title: "Error",
        description: "Failed to start auto-verification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQualityMetrics = async () => {
    try {
      setLoading(true);
      
      const operationId = crypto.randomUUID();
      const newOperation: BulkOperation = {
        id: operationId,
        type: 'update_status',
        status: 'running',
        progress: 0,
        total: 1,
        processed: 0,
        startedAt: new Date()
      };
      
      setOperations(prev => [...prev, newOperation]);
      
      // Update quality metrics
      const { error } = await supabase.rpc('update_car_quality_metrics');
      
      if (error) throw error;
      
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100, processed: 1, completedAt: new Date() }
          : op
      ));
      
      toast({
        title: "Success",
        description: "Quality metrics updated successfully"
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update quality metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCARData = async () => {
    try {
      setLoading(true);
      
      const operationId = crypto.randomUUID();
      const newOperation: BulkOperation = {
        id: operationId,
        type: 'export_data',
        status: 'running',
        progress: 0,
        total: 100,
        processed: 0,
        startedAt: new Date()
      };
      
      setOperations(prev => [...prev, newOperation]);
      
      // Fetch citizen address data
      const { data, error } = await supabase
        .from('citizen_address_with_details')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Create CSV content
      const headers = [
        'ID', 'Person ID', 'Address Kind', 'Scope', 'UAC', 'Unit UAC',
        'Occupant', 'Status', 'Street', 'City', 'Region', 'Country',
        'Effective From', 'Effective To', 'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...data.map(record => [
          record.id,
          record.person_id,
          record.address_kind,
          record.scope,
          record.uac,
          record.unit_uac || '',
          record.occupant,
          record.status,
          record.street || '',
          record.city || '',
          record.region || '',
          record.country || '',
          record.effective_from,
          record.effective_to || '',
          record.created_at
        ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `car-data-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100, processed: data.length, completedAt: new Date() }
          : op
      ));
      
      toast({
        title: "Success",
        description: `Exported ${data.length} records to CSV`
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export CAR data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (type: BulkOperation['type']) => {
    switch (type) {
      case 'auto_verify': return CheckCircle;
      case 'merge_duplicates': return Users;
      case 'update_status': return RefreshCw;
      case 'export_data': return Download;
      default: return Database;
    }
  };

  const getOperationTitle = (type: BulkOperation['type']) => {
    switch (type) {
      case 'auto_verify': return 'Auto-Verification';
      case 'merge_duplicates': return 'Merge Duplicates';
      case 'update_status': return 'Update Metrics';
      case 'export_data': return 'Data Export';
      default: return 'Unknown Operation';
    }
  };

  const getStatusColor = (status: BulkOperation['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: BulkOperation['status']) => {
    switch (status) {
      case 'running': return <Badge variant="outline" className="text-blue-600">Running</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600">Completed</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5" />
                  Auto-Verification
                </CardTitle>
                <CardDescription>
                  Automatically verify citizen addresses that reference verified NAR addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={startAutoVerification} 
                  disabled={loading}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Auto-Verification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RefreshCw className="h-5 w-5" />
                  Update Metrics
                </CardTitle>
                <CardDescription>
                  Refresh system quality metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={updateQualityMetrics} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Metrics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Export CAR data to CSV for analysis or backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={exportCARData} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Safety Warning */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Bulk operations affect multiple records simultaneously. 
              Always backup your data before running bulk operations and verify results carefully.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {operations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No operations have been run yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => {
                const Icon = getOperationIcon(operation.type);
                return (
                  <Card key={operation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">{getOperationTitle(operation.type)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {operation.startedAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(operation.status)}
                      </div>
                      
                      {operation.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{operation.processed}/{operation.total}</span>
                          </div>
                          <Progress value={operation.progress} />
                        </div>
                      )}
                      
                      {operation.status === 'completed' && operation.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Completed: {operation.completedAt.toLocaleString()} 
                          {operation.processed > 0 && ` • Processed ${operation.processed} records`}
                        </p>
                      )}
                      
                      {operation.status === 'error' && operation.error && (
                        <Alert className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{operation.error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}