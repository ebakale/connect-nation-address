import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs';
import { usePostalRole } from '@/hooks/usePostalRole';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { useAgentDeliveries } from '@/hooks/useAgentDeliveries';
import { Package, Plus, Truck, Users, BarChart3, Clock, CheckCircle, AlertTriangle, RotateCcw, Settings, FileUp, DollarSign, Undo2, Calendar } from 'lucide-react';
import { DeliveryOrderForm } from './DeliveryOrderForm';
import { DeliveryOrdersList } from './DeliveryOrdersList';
import { DeliveryAgentView } from './DeliveryAgentView';
import { PostalReports } from './PostalReports';
import { SeedPostalUsers } from './SeedPostalUsers';
import { SeedPostalOrders } from './SeedPostalOrders';
import { SeedCitizenDeliveries } from './SeedCitizenDeliveries';
import { PickupRequestsList } from './PickupRequestsList';
import { ReturnOrdersList } from './ReturnOrdersList';
import { CODManagement } from './CODManagement';
import { BulkImportDialog } from './BulkImportDialog';
import { FixMissingNARAddress } from '@/components/admin/FixMissingNARAddress';
export const PostalDashboard = () => {
  const { t } = useTranslation('postal');
  const { 
    isPostalClerk, isPostalAgent, isPostalDispatcher, isPostalSupervisor, isAdmin,
    canCreateOrders, canAssignOrders, canViewReports 
  } = usePostalRole();
  const { stats: globalStats } = useDeliveryOrders();
  const { stats: agentStats } = useAgentDeliveries();
  
  const [activeTab, setActiveTab] = useState(isPostalAgent ? 'my-deliveries' : 'overview');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const agentStatCards = [
    { key: 'activeDeliveries', icon: Truck, value: agentStats?.active || 0, color: 'text-primary' },
    { key: 'completedToday', icon: CheckCircle, value: agentStats?.completedToday || 0, color: 'text-success' },
    { key: 'totalAssigned', icon: Package, value: agentStats?.total || 0, color: 'text-info' },
  ];

  const globalStatCards = [
    { key: 'pendingIntake', icon: Clock, value: globalStats?.pending_intake || 0, color: 'text-warning' },
    { key: 'readyForAssignment', icon: Package, value: globalStats?.ready_for_assignment || 0, color: 'text-info' },
    { key: 'outForDelivery', icon: Truck, value: globalStats?.out_for_delivery || 0, color: 'text-primary' },
    { key: 'delivered', icon: CheckCircle, value: globalStats?.delivered || 0, color: 'text-success' },
    { key: 'failed', icon: AlertTriangle, value: globalStats?.failed || 0, color: 'text-destructive' },
    { key: 'returned', icon: RotateCcw, value: globalStats?.returned || 0, color: 'text-muted-foreground' },
  ];

  const statCards = isPostalAgent ? agentStatCards : globalStatCards;
  const canManagePickups = isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canManageReturns = isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canManageCOD = isPostalSupervisor || isAdmin;
  const canBulkImport = isPostalClerk || isPostalDispatcher || isPostalSupervisor || isAdmin;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-sm text-muted-foreground">
            {isPostalAgent ? t('agentView') : t('module')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canBulkImport && (
            <Button variant="outline" onClick={() => setShowBulkImport(true)} className="w-full sm:w-auto">
              <FileUp className="h-4 w-4 mr-2" />
              {t('bulkImport.title')}
            </Button>
          )}
          {canCreateOrders && (
            <Button onClick={() => setShowNewOrderForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('order.newOrder')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-3 sm:gap-4 ${isPostalAgent ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {statCards.map((stat) => (
          <Card key={stat.key} className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${stat.color}`} />
                <span className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                {t(`stats.${stat.key}`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 overflow-hidden">
        <ResponsiveTabsList
          tabs={[
            { value: 'overview', label: t('navigation.orders'), icon: <Package className="h-4 w-4" />, condition: !isPostalAgent },
            { value: 'my-deliveries', label: t('navigation.myDeliveries'), icon: <Truck className="h-4 w-4" />, condition: isPostalAgent },
            { value: 'assignments', label: t('navigation.assignments'), icon: <Users className="h-4 w-4" />, condition: canAssignOrders },
            { value: 'pickups', label: t('pickup.title'), icon: <Calendar className="h-4 w-4" />, condition: canManagePickups },
            { value: 'returns', label: t('returns.title'), icon: <Undo2 className="h-4 w-4" />, condition: canManageReturns },
            { value: 'cod', label: t('cod.title'), icon: <DollarSign className="h-4 w-4" />, condition: canManageCOD },
            { value: 'reports', label: t('navigation.reports'), icon: <BarChart3 className="h-4 w-4" />, condition: canViewReports },
            { value: 'admin', label: t('navigation.admin'), icon: <Settings className="h-4 w-4" />, condition: isPostalSupervisor || isAdmin },
          ]}
          value={activeTab}
          onValueChange={setActiveTab}
        />

        {!isPostalAgent && (
          <TabsContent value="overview" className="space-y-4">
            <DeliveryOrdersList />
          </TabsContent>
        )}

        {isPostalAgent && (
          <TabsContent value="my-deliveries" className="space-y-4">
            <DeliveryAgentView />
          </TabsContent>
        )}

        {canAssignOrders && (
          <TabsContent value="assignments" className="space-y-4">
            <DeliveryOrdersList showAssignmentPanel />
          </TabsContent>
        )}

        {canManagePickups && (
          <TabsContent value="pickups" className="space-y-4">
            <PickupRequestsList />
          </TabsContent>
        )}

        {canManageReturns && (
          <TabsContent value="returns" className="space-y-4">
            <ReturnOrdersList />
          </TabsContent>
        )}

        {canManageCOD && (
          <TabsContent value="cod" className="space-y-4">
            <CODManagement />
          </TabsContent>
        )}

        {canViewReports && (
          <TabsContent value="reports" className="space-y-4">
            <PostalReports />
          </TabsContent>
        )}

        {(isPostalSupervisor || isAdmin) && (
          <TabsContent value="admin" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SeedPostalUsers />
              <SeedPostalOrders />
              <SeedCitizenDeliveries />
              <FixMissingNARAddress />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showNewOrderForm && (
        <DeliveryOrderForm 
          open={showNewOrderForm} 
          onClose={() => setShowNewOrderForm(false)} 
        />
      )}

      {showBulkImport && (
        <BulkImportDialog
          open={showBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  );
};