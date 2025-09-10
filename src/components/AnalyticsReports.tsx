import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  Download,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Address } from "@/hooks/useAddresses";
import { useTranslation } from 'react-i18next';

interface AddressStats {
  total: number;
  verified: number;
  pending: number;
  public: number;
  private: number;
}

interface RegionStats {
  region: string;
  addresses: number;
  verified: number;
  pending: number;
}

interface TypeStats {
  type: string;
  count: number;
  percentage: number;
}

interface TimeSeriesData {
  date: string;
  addresses: number;
  verified: number;
}

export const AnalyticsReports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [addressStats, setAddressStats] = useState<AddressStats>({
    total: 0,
    verified: 0,
    pending: 0,
    public: 0,
    private: 0
  });
  const [regionData, setRegionData] = useState<RegionStats[]>([]);
  const [typeData, setTypeData] = useState<TypeStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common']);

  // Unique colors for each address type using semantic design tokens (map by slug)
  const typeColorMap: Record<string, string> = {
    residential: "hsl(var(--chart-1))",    // Blue
    commercial: "hsl(var(--chart-2))",     // Green
    industrial: "hsl(var(--chart-3))",     // Red
    public: "hsl(var(--chart-4))",         // Orange
    government: "hsl(var(--chart-4))",     // Use same as public/government
    other: "hsl(var(--chart-5))",
  };

  const getColorForType = (type: string) => {
    const key = (type || '').toLowerCase().trim();
    return typeColorMap[key] || "hsl(var(--chart-5))";
  };

  useEffect(() => {
    fetchRealAddresses();
  }, []);

  useEffect(() => {
    if (addresses.length > 0) {
      processAnalyticsData();
    }
  }, [selectedPeriod, addresses]);

  const fetchRealAddresses = async () => {
    setLoading(true);
    try {
      const { data: addressData, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setAddresses(addressData || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: t('dashboard:errorFetchingData'),
        description: t('dashboard:failedToFetchData'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateCutoff = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const processAnalyticsData = () => {
    const cutoffDate = getDateCutoff();
    const filteredAddresses = addresses.filter(addr => 
      new Date(addr.created_at) >= cutoffDate
    );

    // Calculate basic stats
    const totalAddresses = filteredAddresses.length;
    const verifiedAddresses = filteredAddresses.filter(addr => addr.verified).length;
    const pendingAddresses = totalAddresses - verifiedAddresses;
    const publicAddresses = filteredAddresses.filter(addr => addr.public).length;
    const privateAddresses = verifiedAddresses - publicAddresses;

    setAddressStats({
      total: totalAddresses,
      verified: verifiedAddresses,
      pending: pendingAddresses,
      public: publicAddresses,
      private: privateAddresses
    });

    // Process regional data
    const regionStats: { [key: string]: RegionStats } = {};
    filteredAddresses.forEach(addr => {
      if (!regionStats[addr.region]) {
        regionStats[addr.region] = {
          region: addr.region,
          addresses: 0,
          verified: 0,
          pending: 0
        };
      }
      regionStats[addr.region].addresses++;
      if (addr.verified) {
        regionStats[addr.region].verified++;
      } else {
        regionStats[addr.region].pending++;
      }
    });
    setRegionData(Object.values(regionStats));

    // Process type data
    const typeStats: { [key: string]: TypeStats } = {};
    filteredAddresses.forEach(addr => {
      if (!typeStats[addr.address_type]) {
        typeStats[addr.address_type] = {
          type: addr.address_type,
          count: 0,
          percentage: 0
        };
      }
      typeStats[addr.address_type].count++;
    });
    
    // Calculate percentages
    Object.values(typeStats).forEach(type => {
      type.percentage = Math.round((type.count / totalAddresses) * 100);
    });
    setTypeData(Object.values(typeStats));

    // Process time series data
    const timeGroups: { [key: string]: { addresses: number; verified: number } } = {};
    const groupBy = selectedPeriod === '7d' ? 'day' : selectedPeriod === '30d' ? 'week' : 'month';
    
    filteredAddresses.forEach(addr => {
      const date = new Date(addr.created_at);
      let groupKey: string;
      
      if (groupBy === 'day') {
        groupKey = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        groupKey = weekStart.toISOString().split('T')[0];
      } else {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!timeGroups[groupKey]) {
        timeGroups[groupKey] = { addresses: 0, verified: 0 };
      }
      timeGroups[groupKey].addresses++;
      if (addr.verified) {
        timeGroups[groupKey].verified++;
      }
    });

    const timeSeriesArray = Object.entries(timeGroups)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setTimeSeriesData(timeSeriesArray);
  };

  const exportReport = (type: string) => {
    try {
      const csvContent = generateEnhancedCSVReport();
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const periodLabel = selectedPeriod === '7d' ? t('dashboard:sevenDays') : 
                         selectedPeriod === '30d' ? t('dashboard:thirtyDays') : 
                         selectedPeriod === '90d' ? t('dashboard:ninetyDays') : t('dashboard:yearly');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `address-analytics-report-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: t('dashboard:exportSuccessful'),
        description: t('dashboard:exportSuccessfulDescription', { period: periodLabel }),
      });
    } catch (error) {
      toast({
        title: t('dashboard:exportFailed'), 
        description: t('dashboard:exportFailedDescription'),
        variant: "destructive",
      });
    }
  };

  const generateEnhancedCSVReport = () => {
    const periodLabel = selectedPeriod === '7d' ? t('dashboard:lastSevenDaysText') : 
                       selectedPeriod === '30d' ? t('dashboard:lastThirtyDaysText') : 
                       selectedPeriod === '90d' ? t('dashboard:lastNinetyDaysText') : t('dashboard:lastYearText');
    
    const exportDate = new Date().toLocaleDateString();
    const csvRows = [
      // Header section
      [t('dashboard:addressAnalyticsReport')],
      [`${t('dashboard:generatedOn')}: ${exportDate}`],
      [`${t('dashboard:period')}: ${periodLabel}`],
      [''],
      
      // Summary statistics
      [t('dashboard:summaryStatistics')],
      [t('dashboard:metric'), t('dashboard:count'), t('dashboard:percentage')],
      [t('dashboard:totalAddressesLabel'), addressStats.total.toString(), '100%'],
      [t('dashboard:verifiedAddressesLabel'), addressStats.verified.toString(), `${Math.round((addressStats.verified/addressStats.total)*100)}%`],
      [t('dashboard:pendingVerification'), addressStats.pending.toString(), `${Math.round((addressStats.pending/addressStats.total)*100)}%`],
      [t('dashboard:publicAddressesLabel'), addressStats.public.toString(), `${Math.round((addressStats.public/addressStats.total)*100)}%`],
      [t('dashboard:privateAddressesLabel'), addressStats.private.toString(), `${Math.round((addressStats.private/addressStats.total)*100)}%`],
      [''],
      
      // Regional breakdown
      [t('dashboard:regionalBreakdown')],
      [t('dashboard:region'), t('dashboard:totalAddressesLabel'), t('dashboard:verified'), t('dashboard:pending'), t('dashboard:verificationRateHeader')],
      ...regionData.map(region => [
        region.region,
        region.addresses.toString(),
        region.verified.toString(),
        region.pending.toString(),
        `${Math.round((region.verified/region.addresses)*100)}%`
      ]),
      [''],
      
      // Address types
      [t('dashboard:addressTypesHeader')],
      [t('dashboard:type'), t('dashboard:count'), t('dashboard:percentage')],
      ...typeData.map(type => [
        type.type,
        type.count.toString(),
        `${type.percentage}%`
      ]),
      [''],
      
      // Time series data
      [t('dashboard:registrationTrendsHeader')],
      [t('dashboard:datePeriod'), t('dashboard:newAddressesHeader'), t('dashboard:verifiedAddressesLabel')],
      ...timeSeriesData.map(data => [
        data.date,
        data.addresses.toString(),
        data.verified.toString()
      ])
    ];
    
    return csvRows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
  };

  if (loading) {
    return <div className="p-4">{t('common:loading')}...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold break-words">{t('dashboard:reportsAnalytics')}</h2>
          <p className="text-sm text-muted-foreground break-words">{t('dashboard:addressRegistrationInsights')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={selectedPeriod} 
            onValueChange={(value) => {
              setSelectedPeriod(value);
              toast({
                title: t('dashboard:periodUpdated'),
                description: `${t('dashboard:analyticsUpdatedFor')} ${value === '7d' ? t('dashboard:lastSevenDays') : value === '30d' ? t('dashboard:lastThirtyDays') : value === '90d' ? t('dashboard:lastNinetyDays') : t('dashboard:lastYear')}`,
              });
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder={t('dashboard:selectPeriod')} />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="7d">{t('dashboard:lastSevenDays')}</SelectItem>
              <SelectItem value="30d">{t('dashboard:lastThirtyDays')}</SelectItem>
              <SelectItem value="90d">{t('dashboard:lastNinetyDays')}</SelectItem>
              <SelectItem value="1y">{t('dashboard:lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => exportReport("Analytics Summary")}
            disabled={loading}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">{loading ? t('common:loading') : t('dashboard:exportCSV')}</span>
            <span className="sm:hidden">{t('dashboard:exportCSV')}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard:totalAddresses')}</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{addressStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {t('dashboard:fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard:verified')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{addressStats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((addressStats.verified / addressStats.total) * 100)}% {t('dashboard:verificationRate')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard:pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{addressStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard:awaitingVerification')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard:publicAddresses')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{addressStats.public.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard:publiclyAccessible')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard:private')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-600">{addressStats.private.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard:restrictedAccess')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger value="regional" className="text-xs sm:text-sm p-2 sm:p-3">{t('dashboard:regionalAnalysis')}</TabsTrigger>
          <TabsTrigger value="types" className="text-xs sm:text-sm p-2 sm:p-3">{t('dashboard:addressTypes')}</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs sm:text-sm p-2 sm:p-3">{t('dashboard:trends')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regional" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t('dashboard:addressesByRegion')}</CardTitle>
                <CardDescription className="text-sm">{t('dashboard:totalAndVerifiedPerRegion')}</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="addresses" fill="hsl(var(--primary))" name={t('dashboard:totalAddresses')} />
                    <Bar dataKey="verified" fill="hsl(var(--success))" name={t('dashboard:verified')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:regionalSummary')}</CardTitle>
                <CardDescription>{t('dashboard:keyStatisticsByRegion')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionData.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.addresses} {t('dashboard:totalAddressesCount')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {region.addresses > 0 ? Math.round((region.verified / region.addresses) * 100) : 0}% {t('dashboard:verifiedText')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {region.pending} {t('dashboard:pendingText')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {regionData.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {t('dashboard:noDataAvailable')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard:addressTypeDistribution')}</CardTitle>
              <CardDescription>{t('dashboard:totalByType')}</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeData.map((entry) => (
                    <Cell key={`cell-${entry.type}`} fill={getColorForType(entry.type)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {typeData.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getColorForType(type.type) }}
                    />
                    <span className="text-sm font-medium">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{type.count.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-1">({type.percentage}%)</span>
                  </div>
                </div>
              ))}
              {typeData.length === 0 && (
                <p className="text-center text-muted-foreground py-2 text-sm">
                  {t('dashboard:noDataAvailable')}
                </p>
              )}
            </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
               <CardTitle>{t('dashboard:registrationTrends')}</CardTitle>
               <CardDescription>{t('dashboard:addressRegistrationOverTime')}</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="addresses" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name={t('dashboard:newAddresses')}
                />
                <Line 
                  type="monotone" 
                  dataKey="verified" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name={t('dashboard:verifiedAddresses')}
                />
              </LineChart>
            </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};