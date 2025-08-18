import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, Edit, Trash2, Users, Building } from "lucide-react";

interface Province {
  id: string;
  name: string;
  code: string;
  region: string;
  population?: number;
  area?: number;
  created_at: string;
}

export const ProvinceManagement = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    region: "",
    population: "",
    area: ""
  });
  const { toast } = useToast();

  // Mock data for demonstration
  const mockProvinces: Province[] = [
    {
      id: "1",
      name: "Luanda",
      code: "LUA",
      region: "Central",
      population: 8000000,
      area: 2418,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Benguela",
      code: "BGU",
      region: "Central",
      population: 2231000,
      area: 31788,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Huíla",
      code: "HUI",
      region: "South",
      population: 2497000,
      area: 75002,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      // For demo purposes, using mock data
      // In a real application, you would fetch from your database
      setProvinces(mockProvinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast({
        title: "Error",
        description: "Failed to load provinces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const provinceData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        region: formData.region,
        population: formData.population ? parseInt(formData.population) : undefined,
        area: formData.area ? parseFloat(formData.area) : undefined
      };

      if (editingProvince) {
        // Update existing province
        const updatedProvinces = provinces.map(p => 
          p.id === editingProvince.id 
            ? { ...p, ...provinceData }
            : p
        );
        setProvinces(updatedProvinces);
        
        toast({
          title: "Success",
          description: "Province updated successfully"
        });
      } else {
        // Add new province
        const newProvince: Province = {
          id: Date.now().toString(),
          ...provinceData,
          created_at: new Date().toISOString()
        };
        setProvinces([...provinces, newProvince]);
        
        toast({
          title: "Success",
          description: "Province added successfully"
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving province:", error);
      toast({
        title: "Error",
        description: "Failed to save province",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (province: Province) => {
    setEditingProvince(province);
    setFormData({
      name: province.name,
      code: province.code,
      region: province.region,
      population: province.population?.toString() || "",
      area: province.area?.toString() || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (provinceId: string) => {
    if (!confirm("Are you sure you want to delete this province?")) return;
    
    try {
      setProvinces(provinces.filter(p => p.id !== provinceId));
      toast({
        title: "Success",
        description: "Province deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting province:", error);
      toast({
        title: "Error",
        description: "Failed to delete province",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      region: "",
      population: "",
      area: ""
    });
    setEditingProvince(null);
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return <div className="p-4">Loading provinces...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Province Management</h2>
          <p className="text-muted-foreground">Manage administrative provinces and regions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProvince(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Province
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProvince ? "Edit Province" : "Add New Province"}
              </DialogTitle>
              <DialogDescription>
                Enter the province details below.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Province Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Province Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., LUA"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Central, North, South"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="population">Population</Label>
                  <Input
                    id="population"
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area (km²)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProvince ? "Update Province" : "Add Province"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provinces.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {provinces.reduce((sum, p) => sum + (p.population || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {provinces.reduce((sum, p) => sum + (p.area || 0), 0).toLocaleString()} km²
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provinces Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provinces</CardTitle>
          <CardDescription>
            List of all administrative provinces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Population</TableHead>
                <TableHead>Area (km²)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provinces.map((province) => (
                <TableRow key={province.id}>
                  <TableCell className="font-medium">{province.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{province.code}</Badge>
                  </TableCell>
                  <TableCell>{province.region}</TableCell>
                  <TableCell>
                    {province.population ? province.population.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {province.area ? province.area.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(province)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(province.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};