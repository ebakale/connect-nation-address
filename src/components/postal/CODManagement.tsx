import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCODTransactions } from '@/hooks/useCODTransactions';
import { CODStatus } from '@/types/postalEnhanced';
import { DollarSign, CheckCircle, Clock, ArrowRight, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export const CODManagement = () => {
  const { t } = useTranslation('postal');
  const { transactions, stats, loading, collectPayment, remitPayment } = useCODTransactions();
  const [statusFilter, setStatusFilter] = useState<CODStatus | 'all'>('all');
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [remittingId, setRemittingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remittanceRef, setRemittanceRef] = useState('');

  const filteredTransactions = transactions.filter(
    (tx) => statusFilter === 'all' || tx.collection_status === statusFilter
  );

  const getStatusColor = (status: CODStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'collected':
        return 'bg-info/10 text-info border-info/20';
      case 'remitted':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleCollect = async (transactionId: string) => {
    await collectPayment({ transaction_id: transactionId, payment_method: paymentMethod });
    setCollectingId(null);
    setPaymentMethod('cash');
  };

  const handleRemit = async (transactionId: string) => {
    await remitPayment({ transaction_id: transactionId, remittance_reference: remittanceRef });
    setRemittingId(null);
    setRemittanceRef('');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                <p className="text-sm text-muted-foreground">{t('cod.pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{stats.collectedCount}</p>
                <p className="text-sm text-muted-foreground">{t('cod.collected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.remittedAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('cod.remitted')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('cod.totalAmount')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t('cod.transactions')}
            </CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as CODStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="pending">{t('cod.pending')}</SelectItem>
                <SelectItem value="collected">{t('cod.collected')}</SelectItem>
                <SelectItem value="remitted">{t('cod.remitted')}</SelectItem>
                <SelectItem value="failed">{t('cod.failed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common:loading')}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('cod.noTransactions')}
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{tx.order_id.slice(0, 8)}...</span>
                        <Badge className={getStatusColor(tx.collection_status as CODStatus)}>
                          {t(`cod.${tx.collection_status}`)}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold">
                        {tx.amount.toLocaleString()} {tx.currency}
                      </p>
                      {tx.receipt_number && (
                        <p className="text-sm text-muted-foreground">
                          {t('cod.receipt')}: {tx.receipt_number}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {tx.collection_status === 'pending' && (
                        <Button size="sm" onClick={() => setCollectingId(tx.id)}>
                          {t('cod.collect')}
                        </Button>
                      )}
                      {tx.collection_status === 'collected' && (
                        <Button size="sm" variant="outline" onClick={() => setRemittingId(tx.id)}>
                          {t('cod.remit')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Collect Dialog */}
      <Dialog open={!!collectingId} onOpenChange={() => setCollectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cod.collectPayment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('cod.paymentMethod')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('cod.methods.cash')}</SelectItem>
                  <SelectItem value="mobile_money">{t('cod.methods.mobileMoney')}</SelectItem>
                  <SelectItem value="card">{t('cod.methods.card')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCollectingId(null)}>
                {t('common:buttons.cancel')}
              </Button>
              <Button onClick={() => collectingId && handleCollect(collectingId)}>
                {t('cod.confirmCollection')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remit Dialog */}
      <Dialog open={!!remittingId} onOpenChange={() => setRemittingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cod.remitFunds')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('cod.remittanceReference')}</Label>
              <Input
                value={remittanceRef}
                onChange={(e) => setRemittanceRef(e.target.value)}
                placeholder={t('cod.referencePlaceholder')}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRemittingId(null)}>
                {t('common:buttons.cancel')}
              </Button>
              <Button onClick={() => remittingId && handleRemit(remittingId)}>
                {t('cod.confirmRemittance')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
