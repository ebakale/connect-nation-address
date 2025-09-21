import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface AutoApprovalStats {
  total_declarations: number;
  auto_approved: number;
  manual_review_required: number;
  auto_approval_rate: number;
}

export function CARAutoApprovalStats() {
  const { t } = useTranslation(['admin']);
  const [stats, setStats] = useState<AutoApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get total declarations
      const { count: totalCount } = await supabase
        .from('citizen_address')
        .select('*', { count: 'exact', head: true });

      // Get confirmed (auto-approved + manually approved)
      const { count: confirmedCount } = await supabase
        .from('citizen_address')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED');

      // Get still pending manual review
      const { count: pendingCount } = await supabase
        .from('citizen_address_manual_review_queue')
        .select('*', { count: 'exact', head: true });

      // Calculate auto-approved (confirmed minus those in manual review originally)
      const autoApproved = (confirmedCount || 0) - (pendingCount || 0);
      const total = totalCount || 0;
      const autoApprovalRate = total > 0 ? (autoApproved / total) * 100 : 0;

      setStats({
        total_declarations: total,
        auto_approved: autoApproved,
        manual_review_required: pendingCount || 0,
        auto_approval_rate: autoApprovalRate
      });
    } catch (error) {
      console.error('Error fetching auto-approval stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('admin:carAutoApprovalStats.title')}
        </CardTitle>
        <CardDescription>
          {t('admin:carAutoApprovalStats.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total_declarations}</div>
            <div className="text-sm text-gray-600">{t('admin:carAutoApprovalStats.totalSubmissions')}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{stats.auto_approved}</div>
            <div className="text-sm text-green-600">{t('admin:carAutoApprovalStats.autoApproved')}</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{stats.manual_review_required}</div>
            <div className="text-sm text-orange-600">{t('admin:carAutoApprovalStats.manualReview')}</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{stats.auto_approval_rate.toFixed(1)}%</div>
            <div className="text-sm text-blue-600">{t('admin:carAutoApprovalStats.approvalRate')}</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">{t('admin:carAutoApprovalStats.systemPerformance')}</span>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {stats.auto_approval_rate > 70 ? t('admin:carAutoApprovalStats.excellent') : stats.auto_approval_rate > 50 ? t('admin:carAutoApprovalStats.good') : t('admin:carAutoApprovalStats.improving')}
          </Badge>
        </div>

        {stats.manual_review_required > 0 && (
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">
                {stats.manual_review_required} {t('admin:carAutoApprovalStats.declarationsNeedAttention')}
              </span>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {t('admin:carAutoApprovalStats.actionRequired')}
            </Badge>
          </div>
        )}

        {stats.auto_approval_rate < 50 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {t('admin:carAutoApprovalStats.considerVerifyingMore')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}