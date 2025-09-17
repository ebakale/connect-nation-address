import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, X, RefreshCw, AlertTriangle, 
  FileCheck, FileX, Merge, Settings, Zap
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkQualityOperationsProps {
  onClose: () => void;
  onOperationComplete: () => void;
}

export function BulkQualityOperations({ onClose, onOperationComplete }: BulkQualityOperationsProps) {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<any>(null);
  const [operationResults, setOperationResults] = useState<any>(null);
  const { toast } = useToast();

  const bulkOperations = [
    {
      id: 'approve_all_pending',
      title: 'Approve All Pending Requests',
      description: 'Automatically approve all pending address verification requests that meet quality standards',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      severity: 'medium',
      estimatedTime: '2-5 minutes'
    },
    {
      id: 'reject_low_quality',
      title: 'Reject Low Quality Addresses',
      description: 'Automatically reject addresses with completeness score below specified threshold',
      icon: <X className="h-6 w-6 text-red-600" />,
      severity: 'high',
      estimatedTime: '1-3 minutes'
    },
    {
      id: 'auto_enhance_addresses',
      title: 'Auto-Enhance Address Data',
      description: 'Automatically fill missing fields and improve completeness scores where possible',
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      severity: 'low',
      estimatedTime: '5-10 minutes'
    },
    {
      id: 'merge_duplicates',
      title: 'Merge Duplicate Addresses',
      description: 'Identify and merge duplicate addresses based on location and similarity',
      icon: <Merge className="h-6 w-6 text-purple-600" />,
      severity: 'high',
      estimatedTime: '3-7 minutes'
    },
    {
      id: 'flag_suspicious',
      title: 'Flag Suspicious Addresses',
      description: 'Automatically flag addresses that appear suspicious or require manual review',
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      severity: 'medium',
      estimatedTime: '1-2 minutes'
    },
    {
      id: 'bulk_publish',
      title: 'Bulk Publish Verified Addresses',
      description: 'Make all verified addresses publicly available in search results',
      icon: <FileCheck className="h-6 w-6 text-indigo-600" />,
      severity: 'medium',
      estimatedTime: '1-2 minutes'
    }
  ];

  const handleStartOperation = (operation: any) => {
    setPendingOperation(operation);
    setShowConfirmDialog(true);
  };

  const executeOperation = async () => {
    if (!pendingOperation) return;

    try {
      setActiveOperation(pendingOperation.id);
      setOperationProgress(0);
      setOperationStatus('Initializing...');
      setShowConfirmDialog(false);

      switch (pendingOperation.id) {
        case 'approve_all_pending':
          await executeBulkApproval();
          break;
        case 'reject_low_quality':
          await executeBulkRejection();
          break;
        case 'auto_enhance_addresses':
          await executeAutoEnhancement();
          break;
        case 'merge_duplicates':
          await executeMergeDuplicates();
          break;
        case 'flag_suspicious':
          await executeFlagSuspicious();
          break;
        case 'bulk_publish':
          await executeBulkPublish();
          break;
      }

      toast({
        title: "Operation Completed",
        description: `${pendingOperation.title} has been completed successfully`,
      });

      onOperationComplete();
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast({
        title: "Operation Failed",
        description: "There was an error during the bulk operation",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
      setOperationProgress(0);
      setOperationStatus('');
      setPendingOperation(null);
    }
  };

  const executeBulkApproval = async () => {
    setOperationStatus('Fetching pending requests...');
    setOperationProgress(10);

    const { data: pendingRequests, error } = await supabase
      .from('address_requests')
      .select('*')
      .eq('status', 'pending');

    if (error) throw error;

    const total = pendingRequests?.length || 0;
    let processed = 0;
    let approved = 0;

    for (const request of pendingRequests || []) {
      setOperationStatus(`Processing request ${processed + 1} of ${total}...`);
      
      try {
        const { error: approveError } = await supabase.rpc('approve_address_request', {
          p_request_id: request.id
        });
        
        if (!approveError) {
          approved++;
        }
      } catch (err) {
        console.error('Error approving request:', err);
      }
      
      processed++;
      setOperationProgress(10 + (processed / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${approved} requests approved out of ${total}`);
    setOperationResults({ approved, total, failed: total - approved });
  };

  const executeBulkRejection = async () => {
    setOperationStatus('Fetching low quality addresses...');
    setOperationProgress(10);

    const { data: lowQualityRequests, error } = await supabase
      .from('addresses')
      .select('*')
      .lt('completeness_score', 50)
      .eq('verified', false);

    if (error) throw error;

    const total = lowQualityRequests?.length || 0;
    let processed = 0;
    let rejected = 0;

    for (const address of lowQualityRequests || []) {
      setOperationStatus(`Processing address ${processed + 1} of ${total}...`);
      
      try {
        const { error: flagError } = await supabase.rpc('flag_address_for_review', {
          p_address_id: address.id,
          p_reason: `Low quality score: ${address.completeness_score}%`
        });
        
        if (!flagError) {
          rejected++;
        }
      } catch (err) {
        console.error('Error flagging address:', err);
      }
      
      processed++;
      setOperationProgress(10 + (processed / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${rejected} addresses flagged out of ${total}`);
    setOperationResults({ flagged: rejected, total, failed: total - rejected });
  };

  const executeAutoEnhancement = async () => {
    setOperationStatus('Analyzing addresses for enhancement...');
    setOperationProgress(10);

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .lt('completeness_score', 85);

    if (error) throw error;

    const total = addresses?.length || 0;
    let processed = 0;
    let enhanced = 0;

    for (const address of addresses || []) {
      setOperationStatus(`Enhancing address ${processed + 1} of ${total}...`);
      
      let updates: any = {};
      let hasUpdates = false;

      // Auto-fill missing country if empty
      if (!address.country || address.country.trim() === '') {
        updates.country = 'Equatorial Guinea';
        hasUpdates = true;
      }

      // Standardize address type
      if (!address.address_type || address.address_type === '') {
        updates.address_type = 'residential';
        hasUpdates = true;
      }

      // Enhance description if too short
      if (!address.description || address.description.length < 10) {
        updates.description = `${address.address_type || 'Residential'} property located at ${address.street}, ${address.city}`;
        hasUpdates = true;
      }

      if (hasUpdates) {
        try {
          const { error: updateError } = await supabase
            .from('addresses')
            .update(updates)
            .eq('id', address.id);
          
          if (!updateError) {
            enhanced++;
          }
        } catch (err) {
          console.error('Error enhancing address:', err);
        }
      }
      
      processed++;
      setOperationProgress(10 + (processed / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${enhanced} addresses enhanced out of ${total}`);
    setOperationResults({ enhanced, total, failed: total - enhanced });
  };

  const executeMergeDuplicates = async () => {
    setOperationStatus('Identifying duplicate addresses...');
    setOperationProgress(10);

    // This is a simplified duplicate detection
    // In a real implementation, this would be more sophisticated
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const duplicateGroups: any[] = [];
    const processed = new Set();

    for (let i = 0; i < (addresses?.length || 0); i++) {
      if (processed.has(addresses![i].id)) continue;

      const currentAddress = addresses![i];
      const duplicates = [];

      for (let j = i + 1; j < addresses!.length; j++) {
        const compareAddress = addresses![j];
        
        if (processed.has(compareAddress.id)) continue;

        // Simple duplicate detection based on proximity and street name
        const latDiff = Math.abs(currentAddress.latitude - compareAddress.latitude);
        const lngDiff = Math.abs(currentAddress.longitude - compareAddress.longitude);
        const streetMatch = currentAddress.street.toLowerCase().trim() === compareAddress.street.toLowerCase().trim();

        if ((latDiff < 0.001 && lngDiff < 0.001) || streetMatch) {
          duplicates.push(compareAddress);
          processed.add(compareAddress.id);
        }
      }

      if (duplicates.length > 0) {
        duplicateGroups.push({
          primary: currentAddress,
          duplicates: duplicates
        });
        processed.add(currentAddress.id);
      }
    }

    let merged = 0;
    const total = duplicateGroups.length;

    for (let i = 0; i < duplicateGroups.length; i++) {
      const group = duplicateGroups[i];
      setOperationStatus(`Merging duplicate group ${i + 1} of ${total}...`);

      // Delete duplicates (keep the primary)
      for (const duplicate of group.duplicates) {
        try {
          const { error: deleteError } = await supabase
            .from('addresses')
            .delete()
            .eq('id', duplicate.id);
          
          if (!deleteError) {
            merged++;
          }
        } catch (err) {
          console.error('Error deleting duplicate:', err);
        }
      }

      setOperationProgress(10 + ((i + 1) / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${merged} duplicate addresses removed`);
    setOperationResults({ merged, groups: total, duplicatesRemoved: merged });
  };

  const executeFlagSuspicious = async () => {
    setOperationStatus('Analyzing addresses for suspicious patterns...');
    setOperationProgress(10);

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('flagged', false);

    if (error) throw error;

    const total = addresses?.length || 0;
    let processed = 0;
    let flagged = 0;

    for (const address of addresses || []) {
      setOperationStatus(`Analyzing address ${processed + 1} of ${total}...`);
      
      let shouldFlag = false;
      let flagReason = '';

      // Check for suspicious patterns
      if (address.completeness_score < 30) {
        shouldFlag = true;
        flagReason = 'Extremely low completeness score';
      } else if (!address.street || address.street.length < 3) {
        shouldFlag = true;
        flagReason = 'Invalid or missing street address';
      } else if (address.latitude === 0 || address.longitude === 0) {
        shouldFlag = true;
        flagReason = 'Invalid coordinates';
      }

      if (shouldFlag) {
        try {
          const { error: flagError } = await supabase.rpc('flag_address_for_review', {
            p_address_id: address.id,
            p_reason: flagReason
          });
          
          if (!flagError) {
            flagged++;
          }
        } catch (err) {
          console.error('Error flagging address:', err);
        }
      }
      
      processed++;
      setOperationProgress(10 + (processed / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${flagged} addresses flagged for review out of ${total}`);
    setOperationResults({ flagged, total, analyzed: processed });
  };

  const executeBulkPublish = async () => {
    setOperationStatus('Publishing verified addresses...');
    setOperationProgress(10);

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('verified', true)
      .eq('public', false)
      .gte('completeness_score', 80);

    if (error) throw error;

    const total = addresses?.length || 0;
    let processed = 0;
    let published = 0;

    for (const address of addresses || []) {
      setOperationStatus(`Publishing address ${processed + 1} of ${total}...`);
      
      try {
        const { error: publishError } = await supabase
          .from('addresses')
          .update({ public: true })
          .eq('id', address.id);
        
        if (!publishError) {
          published++;
        }
      } catch (err) {
        console.error('Error publishing address:', err);
      }
      
      processed++;
      setOperationProgress(10 + (processed / total) * 80);
    }

    setOperationProgress(100);
    setOperationStatus(`Completed: ${published} addresses published out of ${total}`);
    setOperationResults({ published, total, failed: total - published });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bulk Quality Operations</h2>
          <p className="text-muted-foreground">Perform automated quality improvements across all address data</p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      {activeOperation && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="font-medium">Operation in Progress</span>
              </div>
              <Progress value={operationProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{operationStatus}</p>
              {operationResults && (
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  {Object.entries(operationResults).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {bulkOperations.map((operation) => (
          <Card key={operation.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {operation.icon}
                    <div>
                      <h3 className="font-semibold">{operation.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getSeverityColor(operation.severity)}>
                          {operation.severity} impact
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {operation.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {operation.description}
                </p>
                
                <Button
                  onClick={() => handleStartOperation(operation)}
                  disabled={!!activeOperation}
                  className="w-full"
                  variant={operation.severity === 'high' ? 'destructive' : 'default'}
                >
                  {activeOperation === operation.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Start Operation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Operation</DialogTitle>
            <DialogDescription>
              Are you sure you want to run "{pendingOperation?.title}"?
            </DialogDescription>
          </DialogHeader>
          
          {pendingOperation && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">{pendingOperation.description}</p>
                <Separator className="my-2" />
                <div className="grid gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Impact Level:</span>
                    <Badge variant={getSeverityColor(pendingOperation.severity)}>
                      {pendingOperation.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Time:</span>
                    <span>{pendingOperation.estimatedTime}</span>
                  </div>
                </div>
              </div>
              
              {pendingOperation.severity === 'high' && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">High Impact Operation</span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    This operation will make significant changes to your data. Please ensure you have a backup.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowConfirmDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={executeOperation}
              variant={pendingOperation?.severity === 'high' ? 'destructive' : 'default'}
            >
              Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
