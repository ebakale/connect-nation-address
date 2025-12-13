import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePostalRole } from '@/hooks/usePostalRole';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { Package, Plus, Truck, Users, BarChart3, Clock, CheckCircle, AlertTriangle, RotateCcw, Settings } from 'lucide-react';
import { DeliveryOrderForm } from './DeliveryOrderForm';
import { DeliveryOrdersList } from './DeliveryOrdersList';
import { DeliveryAgentView } from './DeliveryAgentView';
import { PostalReports } from './PostalReports';
import { SeedPostalUsers } from './SeedPostalUsers';
import { SeedPostalOrders } from './SeedPostalOrders';

export const PostalDashboard = () => {
  const { t } = useTranslation('postal');
  const { 
    isPostalClerk, isPostalAgent, isPostalDispatcher, isPostalSupervisor, isAdmin,
    canCreateOrders, canAssignOrders, canViewReports 
  } = usePostalRole();
  const { stats, loading } = useDeliveryOrders();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);

  const statCards = [
    { key: 'pendingIntake', icon: Clock, value: stats?.pending_intake || 0, color: 'text-warning' },
    { key: 'readyForAssignment', icon: Package, value: stats?.ready_for_assignment || 0, color: 'text-info' },
    { key: 'outForDelivery', icon: Truck, value: stats?.out_for_delivery || 0, color: 'text-primary' },
    { key: 'delivered', icon: CheckCircle, value: stats?.delivered || 0, color: 'text-success' },
    { key: 'failed', icon: AlertTriangle, value: stats?.failed || 0, color: 'text-destructive' },
    { key: 'returned', icon: RotateCcw, value: stats?.returned || 0, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('module')}</p>
        </div>
        {canCreateOrders && (
          <Button onClick={() => setShowNewOrderForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t('order.newOrder')}
          </Button>
        )}
      </div>

      {/* Stats Grid - 2 rows of 3 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('navigation.orders')}</span>
            <span className="sm:hidden">{t('navigation.orders')}</span>
          </TabsTrigger>
          
          {isPostalAgent && (
            <TabsTrigger value="my-deliveries" className="text-xs sm:text-sm">
              <Truck className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('navigation.myDeliveries')}</span>
              <span className="sm:hidden">{t('delivery.title')}</span>
            </TabsTrigger>
          )}
          
          {canAssignOrders && (
            <TabsTrigger value="assignments" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('navigation.assignments')}</span>
              <span className="sm:hidden">{t('assignment.title')}</span>
            </TabsTrigger>
          )}
          
          {canViewReports && (
            <TabsTrigger value="reports" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('navigation.reports')}</span>
              <span className="sm:hidden">{t('reports.title')}</span>
            </TabsTrigger>
          )}

          {(isPostalSupervisor || isAdmin) && (
            <TabsTrigger value="admin" className="text-xs sm:text-sm">
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span>{t('navigation.admin')}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DeliveryOrdersList />
        </TabsContent>

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

        {canViewReports && (
          <TabsContent value="reports" className="space-y-4">
            <PostalReports />
          </TabsContent>
        )}

        {(isPostalSupervisor || isAdmin) && (
          <TabsContent value="admin" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SeedPostalUsers />
              <SeedPostalOrders />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* New Order Form Dialog */}
      {showNewOrderForm && (
        <DeliveryOrderForm 
          open={showNewOrderForm} 
          onClose={() => setShowNewOrderForm(false)} 
        />
      )}
    </div>
  );
};
