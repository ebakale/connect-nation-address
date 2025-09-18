import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, MapPin, Home, ArrowRight } from 'lucide-react';
import { format } from "date-fns";
import type { CitizenAddress } from '@/types/car';

interface AddressHistoryPanelProps {
  addressHistory: CitizenAddress[];
}

export function AddressHistoryPanel({ addressHistory }: AddressHistoryPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SELF_DECLARED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKindIcon = (kind: string) => {
    return kind === 'PRIMARY' ? <Home className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const getKindColor = (kind: string) => {
    return kind === 'PRIMARY' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  if (addressHistory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No address history available yet. Historical addresses will appear here when you update or retire addresses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Address History</h2>
        <Badge variant="outline">{addressHistory.length} records</Badge>
      </div>

      <div className="space-y-4">
        {addressHistory.map((address, index) => (
          <Card key={address.id} className="relative">
            {index < addressHistory.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-full bg-border -z-10" />
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {getKindIcon(address.address_kind)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-mono">{address.uac}</CardTitle>
                    {address.unit_uac && (
                      <CardDescription className="font-mono text-sm">
                        Unit: {address.unit_uac}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getKindColor(address.address_kind)}>
                    {getKindIcon(address.address_kind)}
                    <span className="ml-1">{address.address_kind}</span>
                  </Badge>
                  <Badge className={getStatusColor(address.status)}>
                    {address.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Effective Period</p>
                    <p className="text-muted-foreground">
                      {format(new Date(address.effective_from), 'MMM d, yyyy')}
                      {address.effective_to && (
                        <>
                          <ArrowRight className="inline h-3 w-3 mx-1" />
                          {format(new Date(address.effective_to), 'MMM d, yyyy')}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Scope & Occupant</p>
                    <p className="text-muted-foreground">
                      {address.scope} - {address.occupant}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Source</p>
                    <p className="text-muted-foreground">{address.source}</p>
                  </div>
                </div>
              </div>
              
              {address.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {address.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}