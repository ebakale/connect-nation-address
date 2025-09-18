import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Home, MapPin, Calendar, User, Trash2, Plus } from 'lucide-react';
import { format } from "date-fns";
import { useCitizenAddresses } from '@/hooks/useCAR';
import type { CitizenAddress } from '@/types/car';

interface CurrentAddressesPanelProps {
  primaryAddress?: CitizenAddress;
  secondaryAddresses: CitizenAddress[];
  onAddSecondary: () => void;
  onSetPrimary: () => void;
}

export function CurrentAddressesPanel({ 
  primaryAddress, 
  secondaryAddresses, 
  onAddSecondary, 
  onSetPrimary 
}: CurrentAddressesPanelProps) {
  const { retireAddress } = useCitizenAddresses();

  const handleRetireAddress = async (addressId: string) => {
    try {
      await retireAddress(addressId, 'User requested removal');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

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

  const getOccupantIcon = (occupant: string) => {
    switch (occupant) {
      case 'OWNER':
        return '🏠';
      case 'TENANT':
        return '🔑';
      case 'FAMILY':
        return '👨‍👩‍👧‍👦';
      default:
        return '📍';
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Address Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Primary Address
          </h2>
          {!primaryAddress && (
            <Button onClick={onSetPrimary} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Set Primary
            </Button>
          )}
        </div>

        {primaryAddress ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">{primaryAddress.uac}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(primaryAddress.status)}>
                    {primaryAddress.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {getOccupantIcon(primaryAddress.occupant)} {primaryAddress.occupant}
                  </Badge>
                </div>
              </div>
              {primaryAddress.unit_uac && (
                <CardDescription className="font-mono text-sm">
                  Unit: {primaryAddress.unit_uac}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Effective from {format(new Date(primaryAddress.effective_from), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {primaryAddress.scope}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onSetPrimary} variant="outline" size="sm">
                    Update Primary
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Retire Primary Address?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your primary address. You can set a new primary address at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRetireAddress(primaryAddress.id)}>
                          Retire Address
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                You haven't set a primary address yet. Your primary address is your main residence.
              </p>
              <Button onClick={onSetPrimary}>
                <Plus className="h-4 w-4 mr-2" />
                Set Primary Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Addresses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Secondary Addresses ({secondaryAddresses.length})
          </h2>
          <Button onClick={onAddSecondary} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Secondary
          </Button>
        </div>

        {secondaryAddresses.length > 0 ? (
          <div className="grid gap-4">
            {secondaryAddresses.map((address) => (
              <Card key={address.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">{address.uac}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(address.status)}>
                        {address.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {getOccupantIcon(address.occupant)} {address.occupant}
                      </Badge>
                    </div>
                  </div>
                  {address.unit_uac && (
                    <CardDescription className="font-mono text-sm">
                      Unit: {address.unit_uac}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Added {format(new Date(address.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {address.scope}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Secondary Address?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove this secondary address from your profile. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRetireAddress(address.id)}>
                            Remove Address
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No secondary addresses registered. Add work locations, temporary residences, or other relevant addresses.
              </p>
              <Button onClick={onAddSecondary} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Secondary Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}