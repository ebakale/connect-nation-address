import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAddressReviewQueue } from '@/hooks/useCAR';
import { AddressRequestReviewCard } from './AddressRequestReviewCard';
import { ReviewQueueStats } from './ReviewQueueStats';
import { useTranslation } from 'react-i18next';
import type { AddressStatus, AddressKind } from '@/types/car';

export function AdminReviewConsole() {
  const { t } = useTranslation(['common', 'admin']);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AddressStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<AddressKind | 'all'>('all');
  
  const { addresses, loading, refetch, updateAddressStatus } = useAddressReviewQueue();

  // Filter addresses based on current tab and filters
  const filteredAddresses = addresses.filter(address => {
    // Tab filtering
    if (activeTab === 'pending' && address.status !== 'SELF_DECLARED') return false;
    if (activeTab === 'flagged' && !address.flagged) return false;
    if (activeTab === 'all' && address.status === 'CONFIRMED') return false; // Hide confirmed from all
    
    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!address.uac?.toLowerCase().includes(query) && 
          !address.street?.toLowerCase().includes(query) &&
          !address.city?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Status filtering
    if (statusFilter !== 'all' && address.status !== statusFilter) return false;
    
    // Kind filtering  
    if (kindFilter !== 'all' && address.address_kind !== kindFilter) return false;
    
    return true;
  });

  const pendingCount = addresses.filter(a => a.status === 'SELF_DECLARED').length;
  const flaggedCount = addresses.filter(a => a.flagged).length;
  const totalCount = addresses.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Address Review Console</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage citizen address requests
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Refresh Queue
        </Button>
      </div>

      {/* Stats Overview */}
      <ReviewQueueStats 
        totalRequests={totalCount}
        pendingRequests={pendingCount}
        flaggedRequests={flaggedCount}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by UAC, street, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value: AddressStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SELF_DECLARED">Self Declared</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Address Type</label>
              <Select value={kindFilter} onValueChange={(value: AddressKind | 'all') => setKindFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRIMARY">Primary</SelectItem>
                  <SelectItem value="SECONDARY">Secondary</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setKindFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Queue Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Flagged ({flaggedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            All Requests ({totalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Reviews</h2>
            <Badge variant="secondary">{filteredAddresses.length} requests</Badge>
          </div>
          {filteredAddresses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground text-center">
                  No pending requests to review. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAddresses.map((address) => (
                <AddressRequestReviewCard
                  key={address.id}
                  address={address}
                  onStatusUpdate={updateAddressStatus}
                  onRefresh={refetch}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Flagged for Review</h2>
            <Badge variant="destructive">{filteredAddresses.length} flagged</Badge>
          </div>
          {filteredAddresses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No flagged requests. All addresses are in good standing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAddresses.map((address) => (
                <AddressRequestReviewCard
                  key={address.id}
                  address={address}
                  onStatusUpdate={updateAddressStatus}
                  onRefresh={refetch}
                  showFlaggedInfo
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Requests</h2>
            <Badge variant="outline">{filteredAddresses.length} requests</Badge>
          </div>
          <div className="space-y-4">
            {filteredAddresses.map((address) => (
              <AddressRequestReviewCard
                key={address.id}
                address={address}
                onStatusUpdate={updateAddressStatus}
                onRefresh={refetch}
                showHistory
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}