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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

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
      const { data: addressData, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setAddresses(addressData || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch address data",
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
      
      const periodLabel = selectedPeriod === '7d' ? '7-days' : 
                         selectedPeriod === '30d' ? '30-days' : 
                         selectedPeriod === '90d' ? '90-days' : 'yearly';
      
      link.setAttribute('href', url);
      link.setAttribute('download', `address-analytics-report-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Analytics report exported for ${periodLabel} period`,
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "There was an error exporting the report",
        variant: "destructive",
      });
    }
  };

  const generateEnhancedCSVReport = () => {
    const periodLabel = selectedPeriod === '7d' ? 'Last 7 Days' : 
                       selectedPeriod === '30d' ? 'Last 30 Days' : 
                       selectedPeriod === '90d' ? 'Last 90 Days' : 'Last Year';
    
    const exportDate = new Date().toLocaleDateString();
    const csvRows = [
      // Header section
      ['Address Analytics Report'],
      [`Generated on: ${exportDate}`],
      [`Period: ${periodLabel}`],
      [''],
      
      // Summary statistics
      ['SUMMARY STATISTICS'],
      ['Metric', 'Count', 'Percentage'],
      ['Total Addresses', addressStats.total.toString(), '100%'],
      ['Verified Addresses', addressStats.verified.toString(), `${Math.round((addressStats.verified/addressStats.total)*100)}%`],
      ['Pending Verification', addressStats.pending.toString(), `${Math.round((addressStats.pending/addressStats.total)*100)}%`],
      ['Public Addresses', addressStats.public.toString(), `${Math.round((addressStats.public/addressStats.total)*100)}%`],
      ['Private Addresses', addressStats.private.toString(), `${Math.round((addressStats.private/addressStats.total)*100)}%`],
      [''],
      
      // Regional breakdown
      ['REGIONAL BREAKDOWN'],
      ['Region', 'Total Addresses', 'Verified', 'Pending', 'Verification Rate'],
      ...regionData.map(region => [
        region.region,
        region.addresses.toString(),
        region.verified.toString(),
        region.pending.toString(),
        `${Math.round((region.verified/region.addresses)*100)}%`
      ]),
      [''],
      
      // Address types
      ['ADDRESS TYPES'],
      ['Type', 'Count', 'Percentage of Total'],
      ...typeData.map(type => [
        type.type,
        type.count.toString(),
        `${type.percentage}%`
      ]),
      [''],
      
      // Time series data
      ['REGISTRATION TRENDS'],
      ['Date/Period', 'New Addresses', 'Verified Addresses'],
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
    return <div className="p-4">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Address registration and verification insights</p>
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={selectedPeriod} 
            onValueChange={(value) => {
              setSelectedPeriod(value);
              toast({
                title: "Period Updated",
                description: `Analytics updated for ${value === '7d' ? 'last 7 days' : value === '30d' ? 'last 30 days' : value === '90d' ? 'last 90 days' : 'last year'}`,
              });
            }}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => exportReport("Analytics Summary")}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Loading..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addressStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{addressStats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((addressStats.verified / addressStats.total) * 100)}% verification rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{addressStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{addressStats.public.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Publicly accessible
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('private')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{addressStats.private.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Restricted access
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="types">Address Types</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regional" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Addresses by Region</CardTitle>
                <CardDescription>Total and verified addresses per region</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="addresses" fill="hsl(var(--primary))" name="Total" />
                  <Bar dataKey="verified" fill="hsl(var(--success))" name="Verified" />
                </BarChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Summary</CardTitle>
                <CardDescription>Key statistics by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionData.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.addresses} total addresses
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {region.addresses > 0 ? Math.round((region.verified / region.addresses) * 100) : 0}% verified
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {region.pending} pending
                        </p>
                      </div>
                    </div>
                  ))}
                  {regionData.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {t('noDataAvailable')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Address Types Distribution</CardTitle>
                <CardDescription>Breakdown by address type</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {typeData.map((entry) => (
                      <Cell key={`cell-${entry.type}`} fill={getColorForType(entry.type)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Type Breakdown</CardTitle>
                <CardDescription>Detailed statistics by address type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeData.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getColorForType(type.type) }}
                        />
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{type.count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">({type.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                  {typeData.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {t('noDataAvailable')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>Address registrations and verifications over time</CardDescription>
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
                  name="New Addresses"
                />
                <Line 
                  type="monotone" 
                  dataKey="verified" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Verifications"
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