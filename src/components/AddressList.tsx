import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Filter,
  Navigation,
  Map
} from 'lucide-react';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

interface AddressListProps {
  onEditAddress?: (address: Address) => void;
  onViewAddress?: (address: Address) => void;
  onViewOnMap?: (address: Address) => void;
}

const AddressList: React.FC<AddressListProps> = ({ onEditAddress, onViewAddress, onViewOnMap }) => {
  const { addresses, loading, updateAddressStatus, deleteAddress } = useAddresses();
  const { toast } = useToast();
  const { t } = useTranslation(['common', 'address']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified' | 'public' | 'private'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 5;

  // Filter addresses based on search query and status
  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = !searchQuery || 
      address.uac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.building?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.address_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'verified' && address.verified) ||
      (filterStatus === 'unverified' && !address.verified) ||
      (filterStatus === 'public' && address.public) ||
      (filterStatus === 'private' && !address.public);

    return matchesSearch && matchesFilter;
  });

  // Reset pagination when addresses change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [addresses, searchQuery, filterStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAddresses.length / addressesPerPage);
  const startIndex = (currentPage - 1) * addressesPerPage;
  const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + addressesPerPage);

  const handleToggleVerified = async (address: Address) => {
    await updateAddressStatus(address.id, { verified: !address.verified });
  };

  const handleTogglePublic = async (address: Address) => {
    await updateAddressStatus(address.id, { public: !address.public });
  };

  const handleDelete = async (address: Address) => {
    if (window.confirm(`Are you sure you want to delete address ${address.uac}?`)) {
      await deleteAddress(address.id);
    }
  };

  const getStatusBadges = (address: Address) => {
    const badges = [];
    
    if (address.verified) {
      badges.push(
        <Badge key="verified" variant="outline" className="border-success text-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="unverified" variant="outline" className="border-warning text-warning">
          <XCircle className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      );
    }

    if (address.public) {
      badges.push(
        <Badge key="public" variant="outline" className="border-primary text-primary">
          <Globe className="h-3 w-3 mr-1" />
          Public
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="private" variant="outline">
          <Lock className="h-3 w-3 mr-1" />
          {t('private')}
        </Badge>
      );
    }

    return badges;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'border-success text-success';
      case 'commercial': return 'border-primary text-primary';
      case 'residential': return 'border-warning text-warning';
      case 'landmark': return 'border-destructive text-destructive';
      default: return '';
    }
  };

  const getDirections = (address: Address) => {
    const destination = `${address.latitude},${address.longitude}`;
    const label = encodeURIComponent(`${address.street}, ${address.city}`);
    
    // Check if user is on mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, try to open native map apps
      window.open(`https://maps.google.com/maps?q=${destination}&z=15&t=m`, '_blank');
    } else {
      // For desktop, open Google Maps in browser
      window.open(`https://www.google.com/maps/search/?api=1&query=${destination}&query_place_id=${label}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Address Management</h2>
          <p className="text-muted-foreground">View and manage all registered addresses</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredAddresses.length} addresses</Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by UAC, street, city, building, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Addresses</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="public">Public Only</option>
                <option value="private">{t('private')} Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count and pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {startIndex + 1}-{Math.min(startIndex + addressesPerPage, filteredAddresses.length)} of {filteredAddresses.length} addresses
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Address List */}
      {paginatedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start by registering your first address.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paginatedAddresses.map((address) => (
            <Card key={address.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onViewAddress?.(address)}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-lg font-bold text-primary group-hover:text-primary/80">
                        {address.uac}
                      </span>
                      <Badge variant="outline" className={getTypeColor(address.address_type)}>
                        {(() => {
                          const v = address.address_type as string | undefined;
                          const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                          const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                          const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                          return safe;
                        })()}
                      </Badge>
                      <div className="flex gap-1">
                        {getStatusBadges(address)}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {address.street}
                          {address.building && `, ${address.building}`}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {address.city}, {address.region}, {address.country}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Coordinates: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                      </div>

                      {address.description && (
                        <div className="text-sm text-muted-foreground italic">
                          {address.description}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(address.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Main Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOnMap?.(address);
                        }}
                        title="View on Map"
                        className="text-xs px-2"
                      >
                        <Map className="h-3 w-3 mr-1" />
                        Map
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(address);
                        }}
                        title="Get Directions"
                        className="text-xs px-2"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Route
                      </Button>
                    </div>
                    
                    {/* Edit/View/Delete Actions */}
                    <div className="flex gap-1">
                      <QRCodeGenerator 
                        uac={address.uac}
                        addressText={`${address.street}${address.building ? ', ' + address.building : ''}, ${address.city}`}
                        variant="icon"
                        size="md"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAddress?.(address);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress?.(address);
                        }}
                        title="Edit Address"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address);
                        }}
                        title="Delete Address"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVerified(address);
                        }}
                        className={`text-xs ${address.verified ? 'border-success text-success' : 'border-warning text-warning'}`}
                      >
                        {address.verified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublic(address);
                        }}
                        className={`text-xs ${address.public ? 'border-primary text-primary' : ''}`}
                      >
                        {address.public ? `Make ${t('private')}` : `Make ${t('public')}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressList;