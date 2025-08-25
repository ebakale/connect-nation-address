import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Globe, FileCheck, BarChart3, Settings, LogOut } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { AddressPublishingQueue } from "@/components/AddressPublishingQueue";
import { AddressUnpublishingQueue } from "@/components/AddressUnpublishingQueue";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const RegistrarDashboard = () => {
  const { role, loading, getGeographicScope } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const geographicScope = getGeographicScope();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('registrarDashboard')}</h1>
              <p className="text-muted-foreground">{t('publishVerifiedAddresses')}</p>
              {geographicScope.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {geographicScope.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      Province: {scope}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Ready to Publish</CardTitle>
              <FileCheck className="h-3 w-3 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">7</div>
              <p className="text-xs text-muted-foreground truncate">Verified addresses</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Published Today</CardTitle>
              <Globe className="h-3 w-3 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">42</div>
              <p className="text-xs text-muted-foreground truncate">Made public</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Total Published</CardTitle>
              <Crown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">12,847</div>
              <p className="text-xs text-muted-foreground truncate">In province</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Coverage</CardTitle>
              <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">87.3%</div>
              <p className="text-xs text-muted-foreground truncate">Provincial coverage</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Publishing Queue
              </CardTitle>
              <CardDescription>
                Review and publish verified addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Publish Addresses
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Address Publishing Queue</DialogTitle>
                    <DialogDescription>
                      Publish verified addresses to the national registry
                    </DialogDescription>
                  </DialogHeader>
                  <AddressPublishingQueue />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                Published Addresses
              </CardTitle>
              <CardDescription>
                Manage addresses in public registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Manage Published
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Published Addresses</DialogTitle>
                    <DialogDescription>
                      Remove addresses from the public registry
                    </DialogDescription>
                  </DialogHeader>
                  <AddressUnpublishingQueue />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Province Management
              </CardTitle>
              <CardDescription>
                Manage provincial boundaries and hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Manage Province
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>
                View provincial statistics and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistrarDashboard;