import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, AlertTriangle, Edit, Merge, Trash2, FileText,
  Clock, MapPin, Check, X, RefreshCw
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QualityIssue {
  id: string;
  type: 'low_quality' | 'duplicate' | 'pending_verification';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  data: any;
  selected?: boolean;
}

interface QualityIssuesFixerProps {
  onClose: () => void;
  onIssuesFixed: () => void;
}

export function QualityIssuesFixer({ onClose, onIssuesFixed }: QualityIssuesFixerProps) {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [fixingIssues, setFixingIssues] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingIssue, setEditingIssue] = useState<QualityIssue | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchQualityIssues();
  }, []);

  const fetchQualityIssues = async () => {
    try {
      setLoading(true);
      
      // Fetch low quality addresses
      const { data: lowQualityAddresses, error: lowQualityError } = await supabase
        .from('addresses')
        .select('*')
        .lt('completeness_score', 85)
        .order('completeness_score', { ascending: true });

      if (lowQualityError) throw lowQualityError;

      // Fetch pending verification requests
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;

      // Fetch all addresses for duplicate detection
      const { data: allAddresses, error: allAddressesError } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: true });

      if (allAddressesError) throw allAddressesError;

      // Process and format issues
      const allIssues: QualityIssue[] = [];

      // Low quality addresses
      lowQualityAddresses?.forEach(address => {
        allIssues.push({
          id: `low_quality_${address.id}`,
          type: 'low_quality',
          title: `Low Quality Address - ${address.completeness_score}%`,
          description: `${address.street}, ${address.city}, ${address.region}`,
          severity: address.completeness_score < 50 ? 'high' : address.completeness_score < 70 ? 'medium' : 'low',
          data: address
        });
      });

      // Pending verification requests
      pendingRequests?.forEach(request => {
        const daysPending = Math.floor((new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
        allIssues.push({
          id: `pending_${request.id}`,
          type: 'pending_verification',
          title: `Pending Verification - ${daysPending} days`,
          description: `${request.street}, ${request.city}, ${request.region}`,
          severity: daysPending > 7 ? 'high' : daysPending > 3 ? 'medium' : 'low',
          data: request
        });
      });

      // Detect duplicate addresses
      const processed = new Set();
      const duplicateGroups: any[] = [];

      allAddresses?.forEach((address, index) => {
        if (processed.has(address.id)) return;

        const duplicates = [];
        
        // Check against remaining addresses
        for (let i = index + 1; i < allAddresses.length; i++) {
          const compareAddress = allAddresses[i];
          if (processed.has(compareAddress.id)) continue;

          // Check for duplicates using stricter criteria
          const addressMatch = address.region === compareAddress.region && 
                              address.city === compareAddress.city &&
                              address.street === compareAddress.street &&
                              address.building === compareAddress.building; // Include building in match
          
          // Precise coordinate proximity (within ~22 meters for true duplicates)
          const latDiff = Math.abs(address.latitude - compareAddress.latitude);
          const lngDiff = Math.abs(address.longitude - compareAddress.longitude);
          const coordinateMatch = latDiff < 0.0002 && lngDiff < 0.0002;

          // Only consider as duplicates if BOTH address AND coordinates match closely
          if (addressMatch && coordinateMatch) {
            duplicates.push(compareAddress);
            processed.add(compareAddress.id);
          }
        }

        if (duplicates.length > 0) {
          duplicateGroups.push({
            primary: address,
            duplicates: duplicates
          });
          processed.add(address.id);

          // Add duplicate issue for each group
          allIssues.push({
            id: `duplicate_${address.id}`,
            type: 'duplicate',
            title: `Duplicate Addresses - ${duplicates.length + 1} found`,
            description: `${address.street}, ${address.city}, ${address.region}`,
            severity: duplicates.length > 2 ? 'high' : 'medium',
            data: {
              primary: address,
              duplicates: duplicates,
              count: duplicates.length + 1
            }
          });
        }
      });

      setIssues(allIssues);
    } catch (error) {
      console.error('Error fetching quality issues:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quality issues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueId]);
    } else {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(issues.map(issue => issue.id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleEditIssue = (issue: QualityIssue) => {
    setEditingIssue(issue);
    setEditFormData(issue.data);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingIssue) return;

    try {
      setFixingIssues(true);

      if (editingIssue.type === 'low_quality') {
        // Update address
        const { error } = await supabase
          .from('addresses')
          .update({
            street: editFormData.street,
            city: editFormData.city,
            region: editFormData.region,
            building: editFormData.building,
            description: editFormData.description,
            address_type: editFormData.address_type
          })
          .eq('id', editingIssue.data.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Issue fixed successfully",
      });

      setShowEditDialog(false);
      setEditingIssue(null);
      await fetchQualityIssues();
      onIssuesFixed();
    } catch (error) {
      console.error('Error fixing issue:', error);
      toast({
        title: "Error",
        description: "Failed to fix issue",
        variant: "destructive",
      });
    } finally {
      setFixingIssues(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete' | 'merge') => {
    try {
      setFixingIssues(true);
      
      const selectedIssueObjects = issues.filter(issue => selectedIssues.includes(issue.id));
      
      for (const issue of selectedIssueObjects) {
        if (issue.type === 'pending_verification') {
          if (action === 'approve') {
            const { error } = await supabase.rpc('approve_address_request', {
              p_request_id: issue.data.id
            });
            if (error) throw error;
          } else if (action === 'reject') {
            const { error } = await supabase.rpc('reject_address_request_with_feedback', {
              p_request_id: issue.data.id,
              p_rejection_reason: 'Bulk rejection - quality review'
            });
            if (error) throw error;
          }
        } else if (issue.type === 'low_quality' && action === 'delete') {
          const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', issue.data.id);
          if (error) throw error;
        } else if (issue.type === 'duplicate' && action === 'merge') {
          // Delete all duplicates, keep the primary
          console.log('Bulk merging duplicates for issue:', issue.id);
          let deletedCount = 0;
          for (const duplicate of issue.data.duplicates) {
            console.log('Bulk deleting duplicate:', duplicate.id);
            const { error } = await supabase
              .from('addresses')
              .delete()
              .eq('id', duplicate.id);
            if (error) {
              console.error('Bulk delete error:', duplicate.id, error);
              throw error;
            }
            deletedCount++;
          }
          console.log(`Bulk deleted ${deletedCount} duplicates for issue ${issue.id}`);
        }
      }

      toast({
        title: "Success",
        description: `Bulk ${action} completed for ${selectedIssues.length} issues`,
      });

      setSelectedIssues([]);
      await fetchQualityIssues();
      onIssuesFixed();
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to complete bulk action",
        variant: "destructive",
      });
    } finally {
      setFixingIssues(false);
    }
  };

  const handleMergeDuplicates = async (issue: QualityIssue) => {
    try {
      setFixingIssues(true);
      
      console.log('Merging duplicates for issue:', issue);
      console.log('Primary address:', issue.data.primary);
      console.log('Duplicates to delete:', issue.data.duplicates);
      
      // Delete all duplicates except the primary
      let deletedCount = 0;
      for (const duplicate of issue.data.duplicates) {
        console.log('Attempting to delete duplicate:', duplicate.id);
        const { error, data } = await supabase
          .from('addresses')
          .delete()
          .eq('id', duplicate.id)
          .select();
        
        if (error) {
          console.error('Error deleting duplicate:', duplicate.id, error);
          throw error;
        }
        
        console.log('Successfully deleted:', data);
        deletedCount++;
      }

      console.log(`Successfully deleted ${deletedCount} duplicate addresses`);

      toast({
        title: "Success",
        description: `Merged ${deletedCount} duplicate addresses`,
      });

      await fetchQualityIssues();
      onIssuesFixed();
    } catch (error) {
      console.error('Error merging duplicates:', error);
      toast({
        title: "Error",
        description: "Failed to merge duplicate addresses",
        variant: "destructive",
      });
    } finally {
      setFixingIssues(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_quality': return <AlertTriangle className="h-4 w-4" />;
      case 'pending_verification': return <Clock className="h-4 w-4" />;
      case 'duplicate': return <Merge className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filterIssuesByType = (type: string) => {
    return issues.filter(issue => issue.type === type);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading quality issues...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quality Issues Fixer</h2>
          <p className="text-muted-foreground">Fix quality issues individually or in bulk</p>
        </div>
        <div className="flex gap-2">
          {selectedIssues.length > 0 && (
            <>
              <Button
                onClick={() => handleBulkAction('approve')}
                disabled={fixingIssues}
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve ({selectedIssues.length})
              </Button>
              <Button
                onClick={() => handleBulkAction('reject')}
                disabled={fixingIssues}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Reject ({selectedIssues.length})
              </Button>
              <Button
                onClick={() => handleBulkAction('merge')}
                disabled={fixingIssues}
                variant="secondary"
                size="sm"
              >
                <Merge className="h-4 w-4 mr-2" />
                Merge ({selectedIssues.length})
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                disabled={fixingIssues}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedIssues.length})
              </Button>
            </>
          )}
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Selected</p>
                <p className="text-2xl font-bold">{selectedIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Low Quality</p>
                <p className="text-2xl font-bold">{filterIssuesByType('low_quality').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Pending Verification</p>
                <p className="text-2xl font-bold">{filterIssuesByType('pending_verification').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Merge className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Duplicates</p>
                <p className="text-2xl font-bold">{filterIssuesByType('duplicate').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="low_quality">Low Quality ({filterIssuesByType('low_quality').length})</TabsTrigger>
          <TabsTrigger value="pending_verification">Pending ({filterIssuesByType('pending_verification').length})</TabsTrigger>
          <TabsTrigger value="duplicate">Duplicates ({filterIssuesByType('duplicate').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <Checkbox
              checked={selectedIssues.length === issues.length && issues.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label>Select All Issues</Label>
          </div>
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              selected={selectedIssues.includes(issue.id)}
              onSelect={handleSelectIssue}
              onEdit={handleEditIssue}
              fixing={fixingIssues}
            />
          ))}
        </TabsContent>

        <TabsContent value="low_quality" className="space-y-4">
          {filterIssuesByType('low_quality').map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              selected={selectedIssues.includes(issue.id)}
              onSelect={handleSelectIssue}
              onEdit={handleEditIssue}
              fixing={fixingIssues}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending_verification" className="space-y-4">
          {filterIssuesByType('pending_verification').map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              selected={selectedIssues.includes(issue.id)}
              onSelect={handleSelectIssue}
              onEdit={handleEditIssue}
              fixing={fixingIssues}
            />
          ))}
        </TabsContent>

        <TabsContent value="duplicate" className="space-y-4">
          {filterIssuesByType('duplicate').map((issue) => (
            <DuplicateIssueCard
              key={issue.id}
              issue={issue}
              selected={selectedIssues.includes(issue.id)}
              onSelect={handleSelectIssue}
              onMerge={handleMergeDuplicates}
              fixing={fixingIssues}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fix Quality Issue</DialogTitle>
            <DialogDescription>
              Update the information to improve the quality score
            </DialogDescription>
          </DialogHeader>
          
          {editingIssue && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={editFormData.street || ''}
                    onChange={(e) => setEditFormData({...editFormData, street: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building">Building/Unit</Label>
                  <Input
                    id="building"
                    value={editFormData.building || ''}
                    onChange={(e) => setEditFormData({...editFormData, building: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={editFormData.region || ''}
                    onChange={(e) => setEditFormData({...editFormData, region: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_type">Address Type</Label>
                  <Select 
                    value={editFormData.address_type || 'residential'} 
                    onValueChange={(value) => setEditFormData({...editFormData, address_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  placeholder="Add additional details about this address..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={fixingIssues}>
              {fixingIssues && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IssueCardProps {
  issue: QualityIssue;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (issue: QualityIssue) => void;
  fixing: boolean;
}

function IssueCard({ issue, selected, onSelect, onEdit, fixing }: IssueCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_quality': return <AlertTriangle className="h-4 w-4" />;
      case 'pending_verification': return <Clock className="h-4 w-4" />;
      case 'duplicate': return <Merge className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`transition-colors ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(issue.id, !!checked)}
              disabled={fixing}
            />
            <div className="flex items-center gap-2">
              {getTypeIcon(issue.type)}
              <div>
                <h4 className="font-medium">{issue.title}</h4>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                  {issue.data.completeness_score && (
                    <Badge variant="outline">{issue.data.completeness_score}% complete</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(issue)}
              size="sm"
              variant="outline"
              disabled={fixing}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DuplicateIssueCardProps {
  issue: QualityIssue;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onMerge: (issue: QualityIssue) => void;
  fixing: boolean;
}

function DuplicateIssueCard({ issue, selected, onSelect, onMerge, fixing }: DuplicateIssueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className={`transition-colors ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(issue.id, !!checked)}
              disabled={fixing}
            />
            <div className="flex items-center gap-2">
              <Merge className="h-4 w-4 text-purple-600" />
              <div>
                <h4 className="font-medium">{issue.title}</h4>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{issue.severity}</Badge>
                  <Badge variant="outline">{issue.data.count} addresses</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onMerge(issue)}
              size="sm"
              variant="outline"
              disabled={fixing}
            >
              <Merge className="h-4 w-4 mr-2" />
              Merge
            </Button>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 p-3 border rounded-lg bg-muted/50">
            <h5 className="font-medium text-sm mb-2">Primary Address (will be kept):</h5>
            <div className="text-sm text-muted-foreground mb-3">
              <p>📍 {issue.data.primary.street}, {issue.data.primary.city}</p>
              <p>🆔 UAC: {issue.data.primary.uac}</p>
              <p>✅ Verified: {issue.data.primary.verified ? 'Yes' : 'No'}</p>
            </div>
            
            <h5 className="font-medium text-sm mb-2">Duplicates (will be removed):</h5>
            <div className="space-y-2">
              {issue.data.duplicates.map((duplicate: any, index: number) => (
                <div key={duplicate.id} className="text-sm text-muted-foreground pl-4 border-l-2 border-red-200">
                  <p>📍 {duplicate.street}, {duplicate.city}</p>
                  <p>🆔 UAC: {duplicate.uac}</p>
                  <p>✅ Verified: {duplicate.verified ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}