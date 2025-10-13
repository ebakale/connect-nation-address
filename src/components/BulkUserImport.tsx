import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Download, Users, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BulkUser {
  full_name: string;
  email: string;
  organization: string;
  phone: string;
  role: string;
  scope_type?: string;
  scope_value?: string;
  password: string;
}

interface ImportResult {
  success: boolean;
  email: string;
  error?: string;
  created_user_id?: string;
}

export function BulkUserImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const csvTemplate = `full_name,email,organization,phone,role,scope_type,scope_value,password
John Doe,john.doe@example.com,Police Department,+240123456789,police_operator,city,Malabo,SecurePass123
Jane Smith,jane.smith@gov.gq,NAR Authority,+240987654321,registrar,region,Bioko Norte,StrongPass456
Maria Garcia,maria@example.com,City Hall,+240555666777,verifier,city,Bata,SafePass789`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string): BulkUser[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const users: BulkUser[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const user: any = {};
      headers.forEach((header, index) => {
        user[header] = values[index] || '';
      });

      // Validate required fields
      if (user.full_name && user.email && user.role && user.password) {
        users.push(user as BulkUser);
      }
    }

    return users;
  };

  const validateUsers = (users: BulkUser[]): string[] => {
    const errors: string[] = [];
    const validRoles = [
      'citizen', 'property_claimant', 'field_agent', 'verifier', 
      'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward', 'support',
      'car_admin', 'residency_verifier',
      'police_admin', 'police_operator', 'police_supervisor', 'police_dispatcher'
    ];

    users.forEach((user, index) => {
      const lineNum = index + 2; // +2 because CSV is 1-indexed and has header

      // Email validation
      if (!user.email.includes('@')) {
        errors.push(`Line ${lineNum}: Invalid email format for ${user.email}`);
      }

      // Role validation
      if (!validRoles.includes(user.role)) {
        errors.push(`Line ${lineNum}: Invalid role "${user.role}" for ${user.email}`);
      }

      // Password strength
      if (user.password.length < 8) {
        errors.push(`Line ${lineNum}: Password too short for ${user.email} (minimum 8 characters)`);
      }

      // Scope validation for specific roles
      if (['police_dispatcher', 'police_supervisor', 'field_agent', 'verifier', 'registrar'].includes(user.role)) {
        if (!user.scope_type || !user.scope_value) {
          errors.push(`Line ${lineNum}: Role "${user.role}" requires scope_type and scope_value for ${user.email}`);
        }
      }
    });

    return errors;
  };

  const importUsers = async () => {
    if (!csvContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV content or upload a file",
        variant: "destructive"
      });
      return;
    }

    const users = parseCSV(csvContent);
    if (users.length === 0) {
      toast({
        title: "Error", 
        description: "No valid users found in CSV",
        variant: "destructive"
      });
      return;
    }

    const validationErrors = validateUsers(users);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: validationErrors.slice(0, 3).join('. ') + (validationErrors.length > 3 ? `... and ${validationErrors.length - 3} more` : ''),
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResults([]);

    const results: ImportResult[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      setProgress(((i + 1) / users.length) * 100);

      try {
        // Create user via edge function
        const { data, error } = await supabase.functions.invoke('admin-user-operations', {
          body: {
            operation: 'createUser',
            userData: {
              full_name: user.full_name,
              email: user.email,
              organization: user.organization,
              phone: user.phone,
              password: user.password,
              role: user.role,
              scope_type: user.scope_type || null,
              scope_value: user.scope_value || null
            }
          }
        });

        if (error) {
          results.push({
            success: false,
            email: user.email,
            error: error.message || 'Failed to create user'
          });
        } else {
          results.push({
            success: true,
            email: user.email,
            created_user_id: data?.user_id
          });
        }
      } catch (error) {
        results.push({
          success: false,
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(results);
    setImporting(false);
    setShowResults(true);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    toast({
      title: "Import Complete",
      description: `${successCount} users created successfully. ${failureCount} failed.`,
      variant: successCount > 0 ? "default" : "destructive"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Import
          </DialogTitle>
          <DialogDescription>
            Import multiple users with roles from a CSV file. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Download Template</CardTitle>
              <CardDescription>
                Download the CSV template and fill it with user information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Upload or Paste CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              <div className="text-center text-muted-foreground">or</div>
              
              <div>
                <Label htmlFor="csv-content">Paste CSV Content</Label>
                <Textarea
                  id="csv-content"
                  placeholder="Paste your CSV content here..."
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Import Process */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing users...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="flex-1">{result.email}</span>
                      {!result.success && (
                        <span className="text-sm text-red-500">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All users will receive their credentials via email</li>
                <li>Passwords must be at least 8 characters long</li>
                <li>Some roles require scope_type and scope_value (city, region, etc.)</li>
                <li>Duplicate emails will be rejected</li>
                <li>Only administrators can use this bulk import feature</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={importUsers} 
              disabled={importing || !csvContent.trim()}
              className="flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Users
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}