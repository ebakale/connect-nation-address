import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, MapPin, CheckCircle, Clock, Users, FileText, Download, Calendar } from "lucide-react";
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
  const {
    toast
  } = useToast();
  const {
    t
  } = useTranslation(['common', 'dashboard']);

  // Specific colors for each address type using semantic design tokens
  const typeColorMap: Record<string, string> = {
    "Commercial": "hsl(var(--chart-commercial))",
    "Public": "hsl(var(--chart-public))",
    "Residential": "hsl(var(--chart-residential))",
    "Industrial": "hsl(var(--chart-industrial))"
  };
  const getColorForType = (type: string) => typeColorMap[type] || "hsl(var(--muted))";
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
      const {
        data: addressData,
        error
      } = await supabase.from('addresses').select('*').order('created_at', {
        ascending: true
      });
      if (error) throw error;
      setAddresses(addressData || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch address data",
        variant: "destructive"
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
    const filteredAddresses = addresses.filter(addr => new Date(addr.created_at) >= cutoffDate);

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
    const regionStats: {
      [key: string]: RegionStats;
    } = {};
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
    const typeStats: {
      [key: string]: TypeStats;
    } = {};
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
      type.percentage = Math.round(type.count / totalAddresses * 100);
    });
    setTypeData(Object.values(typeStats));

    // Process time series data
    const timeGroups: {
      [key: string]: {
        addresses: number;
        verified: number;
      };
    } = {};
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
        timeGroups[groupKey] = {
          addresses: 0,
          verified: 0
        };
      }
      timeGroups[groupKey].addresses++;
      if (addr.verified) {
        timeGroups[groupKey].verified++;
      }
    });
    const timeSeriesArray = Object.entries(timeGroups).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date));
    setTimeSeriesData(timeSeriesArray);
  };
  const exportReport = (type: string) => {
    try {
      const csvContent = generateEnhancedCSVReport();
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const periodLabel = selectedPeriod === '7d' ? '7-days' : selectedPeriod === '30d' ? '30-days' : selectedPeriod === '90d' ? '90-days' : 'yearly';
      link.setAttribute('href', url);
      link.setAttribute('download', `address-analytics-report-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: `Analytics report exported for ${periodLabel} period`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report",
        variant: "destructive"
      });
    }
  };
  const generateEnhancedCSVReport = () => {
    const periodLabel = selectedPeriod === '7d' ? 'Last 7 Days' : selectedPeriod === '30d' ? 'Last 30 Days' : selectedPeriod === '90d' ? 'Last 90 Days' : 'Last Year';
    const exportDate = new Date().toLocaleDateString();
    const csvRows = [
    // Header section
    ['Address Analytics Report'], [`Generated on: ${exportDate}`], [`Period: ${periodLabel}`], [''],
    // Summary statistics
    ['SUMMARY STATISTICS'], ['Metric', 'Count', 'Percentage'], ['Total Addresses', addressStats.total.toString(), '100%'], ['Verified Addresses', addressStats.verified.toString(), `${Math.round(addressStats.verified / addressStats.total * 100)}%`], ['Pending Verification', addressStats.pending.toString(), `${Math.round(addressStats.pending / addressStats.total * 100)}%`], ['Public Addresses', addressStats.public.toString(), `${Math.round(addressStats.public / addressStats.total * 100)}%`], ['Private Addresses', addressStats.private.toString(), `${Math.round(addressStats.private / addressStats.total * 100)}%`], [''],
    // Regional breakdown
    ['REGIONAL BREAKDOWN'], ['Region', 'Total Addresses', 'Verified', 'Pending', 'Verification Rate'], ...regionData.map(region => [region.region, region.addresses.toString(), region.verified.toString(), region.pending.toString(), `${Math.round(region.verified / region.addresses * 100)}%`]), [''],
    // Address types
    ['ADDRESS TYPES'], ['Type', 'Count', 'Percentage of Total'], ...typeData.map(type => [type.type, type.count.toString(), `${type.percentage}%`]), [''],
    // Time series data
    ['REGISTRATION TRENDS'], ['Date/Period', 'New Addresses', 'Verified Addresses'], ...timeSeriesData.map(data => [data.date, data.addresses.toString(), data.verified.toString()])];
    return csvRows.map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(',')).join('\n');
  };
  if (loading) {
    return <div className="p-4">{t('loading')}...</div>;
  }
  return <div className="space-y-4 sm:space-y-6 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold break-words">{t('reportsAnalytics')}</h2>
          <p className="text-sm text-muted-foreground break-words">{t('addressRegistrationInsights')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={value => {
          setSelectedPeriod(value);
          toast({
            title: t('periodUpdated'),
            description: `${t('analyticsUpdatedFor')} ${value === '7d' ? t('lastSevenDays') : value === '30d' ? t('lastThirtyDays') : value === '90d' ? t('lastNinetyDays') : t('lastYear')}`
          });
        }}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder={t('selectPeriod')} />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="7d">{t('lastSevenDays')}</SelectItem>
              <SelectItem value="30d">{t('lastThirtyDays')}</SelectItem>
              <SelectItem value="90d">{t('lastNinetyDays')}</SelectItem>
              <SelectItem value="1y">{t('lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport("Analytics Summary")} disabled={loading} className="w-full sm:w-auto text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">{loading ? t('loading') : t('exportCSV')}</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('totalAddresses')}</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{addressStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('verified')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{addressStats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(addressStats.verified / addressStats.total * 100)}% {t('verificationRate')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{addressStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('awaitingVerification')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('publicAddresses')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{addressStats.public.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('publiclyAccessible')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('private')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-600">{addressStats.private.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('restrictedAccess')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger value="regional" className="text-xs sm:text-sm p-2 sm:p-3">{t('regionalAnalysis')}</TabsTrigger>
          <TabsTrigger value="types" className="text-xs sm:text-sm p-2 sm:p-3">{t('addressTypes')}</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs sm:text-sm p-2 sm:p-3">{t('trends')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regional" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t('addressesByRegion')}</CardTitle>
                <CardDescription className="text-sm">{t('totalAndVerifiedPerRegion')}</CardDescription>
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
                    <Bar dataKey="addresses" fill="hsl(var(--primary))" name="Total" />
                    <Bar dataKey="verified" fill="hsl(var(--success))" name="Verified" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('regionalSummary')}</CardTitle>
                <CardDescription>{t('keyStatisticsByRegion')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionData.map((region, index) => <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.addresses} {t('totalAddressesCount')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {region.addresses > 0 ? Math.round(region.verified / region.addresses * 100) : 0}% verified
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {region.pending} pending
                        </p>
                      </div>
                    </div>)}
                  {regionData.length === 0 && <p className="text-center text-muted-foreground py-4">
                      {t('noDataAvailable')}
                    </p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('addressTypeDistribution')}</CardTitle>
                <CardDescription>{t('totalByType')}</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" label={({
                    type,
                    percentage
                  }) => `${type}: ${percentage}%`}>
                    {typeData.map(entry => <Cell key={`cell-${entry.type}`} fill={getColorForType(entry.type)} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('totalByType')}</CardTitle>
                <CardDescription>{t('addressTypeDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeData.map((type, index) => <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: getColorForType(type.type)
                    }} />
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{type.count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">({type.percentage}%)</span>
                      </div>
                    </div>)}
                  {typeData.length === 0 && <p className="text-center text-muted-foreground py-4">
                      {t('noDataAvailable')}
                    </p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        
      </Tabs>
    </div>;
};