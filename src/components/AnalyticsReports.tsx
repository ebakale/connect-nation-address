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

  // Mock data for demonstration
  const mockRegionData: RegionStats[] = [
    { region: "Luanda", addresses: 450, verified: 380, pending: 70 },
    { region: "Benguela", addresses: 280, verified: 240, pending: 40 },
    { region: "Huíla", addresses: 190, verified: 160, pending: 30 },
    { region: "Namibe", addresses: 120, verified: 100, pending: 20 },
    { region: "Cabinda", addresses: 95, verified: 80, pending: 15 }
  ];

  const mockTypeData: TypeStats[] = [
    { type: "Residential", count: 520, percentage: 45 },
    { type: "Commercial", count: 290, percentage: 25 },
    { type: "Industrial", count: 175, percentage: 15 },
    { type: "Public", count: 115, percentage: 10 },
    { type: "Other", count: 58, percentage: 5 }
  ];

  const mockTimeSeriesData: TimeSeriesData[] = [
    { date: "2024-01-01", addresses: 50, verified: 45 },
    { date: "2024-01-08", addresses: 65, verified: 58 },
    { date: "2024-01-15", addresses: 78, verified: 70 },
    { date: "2024-01-22", addresses: 92, verified: 85 },
    { date: "2024-01-29", addresses: 105, verified: 98 }
  ];

  const pieColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--destructive))"];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const totalAddresses = mockRegionData.reduce((sum, region) => sum + region.addresses, 0);
      const totalVerified = mockRegionData.reduce((sum, region) => sum + region.verified, 0);
      const totalPending = mockRegionData.reduce((sum, region) => sum + region.pending, 0);
      
      setAddressStats({
        total: totalAddresses,
        verified: totalVerified,
        pending: totalPending,
        public: Math.floor(totalVerified * 0.7),
        private: Math.floor(totalVerified * 0.3)
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
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
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport("summary")}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
            <CardTitle className="text-sm font-medium">Private</CardTitle>
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
                  <BarChart data={mockRegionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="addresses" fill="hsl(var(--primary))" name="Total" />
                    <Bar dataKey="verified" fill="hsl(var(--secondary))" name="Verified" />
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
                  {mockRegionData.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.addresses} total addresses
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {Math.round((region.verified / region.addresses) * 100)}% verified
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {region.pending} pending
                        </p>
                      </div>
                    </div>
                  ))}
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
                      data={mockTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                    >
                      {mockTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
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
                  {mockTypeData.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{type.count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">({type.percentage}%)</span>
                      </div>
                    </div>
                  ))}
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
                <LineChart data={mockTimeSeriesData}>
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
                    stroke="hsl(var(--secondary))" 
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