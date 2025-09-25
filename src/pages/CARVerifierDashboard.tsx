import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { CARVerifierDashboard } from '@/components/CARVerifierDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function CARVerifierDashboardPage() {
  const { hasCARAccess, loading, role, isCARVerifier, hasCARVerificationAccess } = useUserRole();
  console.log('CARVerifierDashboardPage role', { role, hasCARAccess, hasCARVerificationAccess, isCARVerifier });
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navigateFn, setNavigateFn] = useState<((pageId: string) => void) | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!hasCARAccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You need CAR (Citizen Address Repository) access permissions to view this dashboard.
                Please contact your administrator to request access.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={(id) => { setCurrentPage(id); navigateFn?.(id); }}>
      <div className="container mx-auto px-4 py-8">
        <CARVerifierDashboard onRegisterNavigate={(fn) => setNavigateFn(() => fn)} />
      </div>
    </Layout>
  );
}