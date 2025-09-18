import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, RefreshCw, AlertTriangle, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface RejectedItem {
  id: string;
  item_type: 'request' | 'address';
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  rejection_reason?: string;
  reviewer_notes?: string;
  rejected_at: string;
  created_at: string;
}

export const RejectedItemsManager = () => {
  const [rejectedItems, setRejectedItems] = useState<RejectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRejectedItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Simple fetch to avoid type recursion
      const requests = await fetch(`/api/rejected-items?user_id=${user.id}`)
        .then(res => res.json())
        .catch(() => ({ data: [] }));
      
      setRejectedItems(requests.data || []);
    } catch (error) {
      console.error('Failed to fetch rejected items:', error);
      toast({
        title: "Error",
        description: "Failed to load rejected items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedItems();
  }, [user]);

  const formatAddress = (item: RejectedItem) => {
    const parts = [item.building, item.street, item.city, item.region, item.country].filter(Boolean);
    return parts.join(', ');
  };

  const handleDelete = async (item: RejectedItem) => {
    if (!confirm('Are you sure you want to permanently delete this rejected item?')) return;

    try {
      const table = item.item_type === 'request' ? 'address_requests' : 'addresses';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setRejectedItems(prev => prev.filter(i => i.id !== item.id));
      toast({
        title: "Success",
        description: "Rejected item deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: "Error",
        description: "Failed to delete rejected item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <CardTitle>Loading rejected items...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Rejected Items
          </CardTitle>
          <Button
            onClick={fetchRejectedItems}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rejectedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No rejected items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rejectedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.item_type === 'request' ? (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{formatAddress(item)}</span>
                      <Badge variant="destructive">
                        {item.item_type === 'request' ? 'Request' : 'Address'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Rejected: {format(new Date(item.rejected_at), 'MMM dd, yyyy HH:mm')}</p>
                      <p>Type: {item.address_type}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDelete(item)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {(item.rejection_reason || item.reviewer_notes) && (
                  <div className="pt-3 border-t">
                    <span className="text-sm font-medium">Rejection Reason:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.rejection_reason || item.reviewer_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};