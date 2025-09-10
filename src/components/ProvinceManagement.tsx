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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['admin', 'common']);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setProvinces(data || []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast({
        title: t('admin:error'),
        description: t('admin:errorLoadingProvinces'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.region) {
      toast({
        title: t('admin:validationError'),
        description: t('admin:fillAllRequiredFields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
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
        const { data, error } = await supabase
          .from('provinces')
          .update(provinceData)
          .eq('id', editingProvince.id)
          .select()
          .single();

        if (error) throw error;

        setProvinces(provinces.map(p => p.id === editingProvince.id ? data : p));
        
        toast({
          title: t('admin:success'),
          description: t('admin:provinceUpdatedSuccessfully')
        });
      } else {
        // Add new province
        const { data, error } = await supabase
          .from('provinces')
          .insert([provinceData])
          .select()
          .single();

        if (error) throw error;

        setProvinces([...provinces, data]);
        
        toast({
          title: t('admin:success'),
          description: t('admin:provinceAddedSuccessfully')
        });
      }

      resetForm();
    } catch (error: any) {
      console.error("Error saving province:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save province",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (provinceId: string) => {
    if (!confirm("Are you sure you want to delete this province?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('provinces')
        .delete()
        .eq('id', provinceId);

      if (error) throw error;

      setProvinces(provinces.filter(p => p.id !== provinceId));
      toast({
        title: "Success",
        description: "Province deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting province:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete province",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <div className="space-y-4 sm:space-y-6 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold break-words">Province Management</h2>
          <p className="text-sm text-muted-foreground break-words">Manage administrative provinces and regions</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g., Insular, Continental"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  {editingProvince ? "Update Province" : "Add Province"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{provinces.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {provinces.reduce((sum, p) => sum + (p.population || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {provinces.reduce((sum, p) => sum + (p.area || 0), 0).toLocaleString()} km²
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provinces Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Provinces</CardTitle>
          <CardDescription>
            List of all administrative provinces
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                      <Badge variant="outline" className="text-xs">{province.code}</Badge>
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
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(province.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {provinces.map((province) => (
              <Card key={province.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base break-words">{province.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">{province.code}</Badge>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(province)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(province.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Region:</span>
                      <span className="font-medium break-words text-right">{province.region}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Population:</span>
                      <span className="font-medium">
                        {province.population ? province.population.toLocaleString() : "-"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Area:</span>
                      <span className="font-medium">
                        {province.area ? `${province.area.toLocaleString()} km²` : "-"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium text-xs">
                        {new Date(province.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {provinces.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No provinces found</p>
                <p className="text-sm">Add your first province to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};