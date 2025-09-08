import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, FileText, Users, LogOut } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { AddressVerificationQueue } from "@/components/AddressVerificationQueue";
import { VerificationTools } from "@/components/VerificationTools";
import { AddressRequestApproval } from "@/components/AddressRequestApproval";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';


const VerifierDashboard = () => {
  const { role, loading, getGeographicScope } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [queueOpen, setQueueOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);

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
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('verifierDashboard')}</h1>
              <p className="text-muted-foreground">{t('reviewVerifySubmissions')}</p>
              {geographicScope.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {geographicScope.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      District: {scope}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              
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
              <CardTitle className="text-xs font-medium truncate">Pending Review</CardTitle>
              <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">23</div>
              <p className="text-xs text-muted-foreground truncate">Requires verification</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Verified Today</CardTitle>
              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">18</div>
              <p className="text-xs text-muted-foreground truncate">Approved addresses</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Total Verified</CardTitle>
              <Shield className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">1,247</div>
              <p className="text-xs text-muted-foreground truncate">This month</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">Quality Score</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground truncate">Accuracy rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Address Requests
              </CardTitle>
              <CardDescription>
                Approve or reject citizen address requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={requestsOpen} onOpenChange={setRequestsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Review Requests
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Address Request Approval</DialogTitle>
                    <DialogDescription>
                      Review and approve pending address requests from citizens
                    </DialogDescription>
                  </DialogHeader>
                  <AddressRequestApproval requests={[]} onUpdate={() => {}} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Verification Queue
              </CardTitle>
              <CardDescription>
                Verify approved addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={queueOpen} onOpenChange={setQueueOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Start Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Address Verification Queue</DialogTitle>
                    <DialogDescription>
                      Review and verify pending address submissions
                    </DialogDescription>
                  </DialogHeader>
                  <AddressVerificationQueue />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Verification Tools
              </CardTitle>
              <CardDescription>
                Access verification and quality control tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={toolsOpen} onOpenChange={setToolsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Open Tools
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Verification Tools</DialogTitle>
                    <DialogDescription>
                      Advanced tools for address verification and quality control
                    </DialogDescription>
                  </DialogHeader>
                  <VerificationTools />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Reports
              </CardTitle>
              <CardDescription>
                View verification statistics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifierDashboard;