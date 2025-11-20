import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Clock, Users, Accessibility, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface OrganizationAddress {
  id: string;
  organization_name: string;
  business_category: string;
  business_address_type: string;
  primary_contact_phone?: string;
  primary_contact_email?: string;
  employee_count?: number;
  customer_capacity?: number;
  parking_available: boolean;
  parking_capacity?: number;
  wheelchair_accessible: boolean;
  is_public_service: boolean;
  appointment_required: boolean;
  services_offered?: string[];
  languages_spoken?: string[];
  operating_hours?: any;
  publicly_visible: boolean;
  show_contact_info: boolean;
  addresses: {
    street: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export function BusinessDirectory() {
  const { t } = useTranslation(['business', 'address']);
  const [businesses, setBusinesses] = useState<OrganizationAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_addresses')
        .select(`
          *,
          addresses!organization_addresses_address_id_fkey (
            street,
            city,
            region,
            country,
            latitude,
            longitude
          )
        `)
        .eq('publicly_visible', true)
        .order('organization_name');

      if (error) throw error;

      setBusinesses(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map(b => b.business_category) || [])
      ).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error(t('search.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.organization_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      business.services_offered?.some(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = categoryFilter === "all" || 
      business.business_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center py-8">{t('search.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.searchBusinesses')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={t('search.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCategories')}</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('search.noBusinessesFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow">
              <Collapsible open={expandedCards.has(business.id)} onOpenChange={() => toggleCard(business.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Building2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <CardTitle className="text-lg break-words">
                          {business.organization_name}
                        </CardTitle>
                      </div>
                      {expandedCards.has(business.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-3 animate-accordion-down">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{business.business_category}</Badge>
                      {business.is_public_service && (
                        <Badge variant="default">{t('search.publicService')}</Badge>
                      )}
                    </div>

                    {business.addresses && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="break-words">
                          {business.addresses.street}, {business.addresses.city}
                        </span>
                      </div>
                    )}

                    {business.show_contact_info && (
                      <>
                        {business.primary_contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${business.primary_contact_phone}`} className="hover:underline">
                              {business.primary_contact_phone}
                            </a>
                          </div>
                        )}
                        {business.primary_contact_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${business.primary_contact_email}`} className="hover:underline break-all">
                              {business.primary_contact_email}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {business.services_offered && business.services_offered.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {business.services_offered.slice(0, 3).map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {business.services_offered.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{business.services_offered.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {business.parking_available && (
                        <Badge variant="outline" className="text-xs">
                          🅿️ {t('search.parking')}
                        </Badge>
                      )}
                      {business.wheelchair_accessible && (
                        <Badge variant="outline" className="text-xs">
                          <Accessibility className="h-3 w-3 mr-1" />
                          {t('search.accessible')}
                        </Badge>
                      )}
                      {business.appointment_required && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {t('search.appointmentRequired')}
                        </Badge>
                      )}
                    </div>

                    {business.addresses && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => window.open(
                          `https://www.google.com/maps/search/?api=1&query=${business.addresses.latitude},${business.addresses.longitude}`,
                          '_blank'
                        )}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t('search.viewOnMap')}
                      </Button>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
