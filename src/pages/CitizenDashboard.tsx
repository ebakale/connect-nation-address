import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, FileText, AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const CitizenDashboard = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Citizen Portal</h1>
          <p className="text-muted-foreground">Search verified addresses and submit requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Addresses
              </CardTitle>
              <CardDescription>
                Find verified addresses in the national database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Search Database
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submit Request
              </CardTitle>
              <CardDescription>
                Request address verification or corrections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Address Status
              </CardTitle>
              <CardDescription>
                Check the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Track Status
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• All address searches show verified addresses only</li>
              <li>• Personal information is protected and redacted</li>
              <li>• Coordinates are approximated for privacy</li>
              <li>• Submit requests for new address verification</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard;