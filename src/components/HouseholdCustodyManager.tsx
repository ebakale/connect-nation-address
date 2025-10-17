import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Edit, Calendar, Clock, Percent } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import type { HouseholdMember, CustodyType } from '@/types/car';

interface HouseholdCustodyManagerProps {
  householdId: string;
  members: HouseholdMember[];
  onUpdate: () => void;
}

export function HouseholdCustodyManager({ householdId, members, onUpdate }: HouseholdCustodyManagerProps) {
  const { t } = useTranslation(['car', 'common']);
  const { toast } = useToast();
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [custodyType, setCustodyType] = useState<CustodyType>('FULL');
  const [residencePercentage, setResidencePercentage] = useState<number>(100);
  const [custodySchedule, setCustodySchedule] = useState('');
  const [isPrimaryHousehold, setIsPrimaryHousehold] = useState(false);
  const [notes, setNotes] = useState('');

  const handleEditMember = (member: HouseholdMember) => {
    setEditingMember(member);
    setCustodyType(member.custody_type || 'FULL');
    setResidencePercentage(member.residence_percentage || 100);
    setCustodySchedule(JSON.stringify(member.custody_schedule || {}, null, 2));
    setIsPrimaryHousehold(member.is_primary_household);
    setNotes(member.notes || '');
    setIsDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      let parsedSchedule = null;
      if (custodySchedule.trim()) {
        try {
          parsedSchedule = JSON.parse(custodySchedule);
        } catch (e) {
          toast({
            title: t('common:error'),
            description: 'Invalid custody schedule JSON format',
            variant: 'destructive',
          });
          return;
        }
      }

      const { error } = await supabase
        .from('household_members')
        .update({
          custody_type: custodyType,
          residence_percentage: residencePercentage,
          custody_schedule: parsedSchedule,
          is_primary_household: isPrimaryHousehold,
          notes: notes || null,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: t('car:household.messages.memberAdded'),
      });

      setIsDialogOpen(false);
      setEditingMember(null);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast({
        title: t('common:error'),
        description: error.message || 'Failed to update member',
        variant: 'destructive',
      });
    }
  };

  const getCustodyBadgeColor = (custody?: CustodyType) => {
    switch (custody) {
      case 'FULL': return 'bg-green-100 text-green-800';
      case 'SHARED': return 'bg-blue-100 text-blue-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'TEMPORARY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total residence percentage for validation
  const totalResidencePercentage = members.reduce((sum, m) => sum + (m.residence_percentage || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('car:household.title')} - Custody & Residence Management
        </CardTitle>
        <CardDescription>
          Manage custody arrangements and residence percentages for household members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('car:household.members.noMembers')}
            </p>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Members</p>
                        <p className="text-2xl font-bold">{members.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Residence %</p>
                        <p className={`text-2xl font-bold ${totalResidencePercentage > 100 ? 'text-destructive' : ''}`}>
                          {totalResidencePercentage}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Primary Residents</p>
                        <p className="text-2xl font-bold">
                          {members.filter(m => m.is_primary_household).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Member List */}
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">
                          {member.dependent_id ? 'Dependent Member' : 'Adult Member'}
                        </p>
                        {member.is_primary_household && (
                          <Badge variant="default" className="text-xs">
                            {t('car:household.primaryHousehold')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {member.custody_type && (
                          <Badge className={getCustodyBadgeColor(member.custody_type)}>
                            {t(`car:household.custodyTypes.${member.custody_type}`)}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          <Percent className="h-3 w-3 mr-1" />
                          {member.residence_percentage || 0}% residence
                        </Badge>
                        <Badge variant="outline">
                          {t(`car:household.roles.${member.household_role}`)}
                        </Badge>
                        <Badge variant="secondary">
                          {t(`car:household.memberStatus.${member.membership_status}`)}
                        </Badge>
                      </div>
                      {member.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{member.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Edit Member Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Member Custody & Residence</DialogTitle>
              <DialogDescription>
                Update custody arrangement and residence details for this member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custodyType">{t('car:household.form.custodyType')}</Label>
                <Select value={custodyType} onValueChange={(value) => setCustodyType(value as CustodyType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('car:household.form.selectCustodyType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">{t('car:household.custodyTypes.FULL')}</SelectItem>
                    <SelectItem value="SHARED">{t('car:household.custodyTypes.SHARED')}</SelectItem>
                    <SelectItem value="PARTIAL">{t('car:household.custodyTypes.PARTIAL')}</SelectItem>
                    <SelectItem value="TEMPORARY">{t('car:household.custodyTypes.TEMPORARY')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residencePercentage">
                  {t('car:household.form.residencePercentage')} (%)
                </Label>
                <Input
                  id="residencePercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={residencePercentage}
                  onChange={(e) => setResidencePercentage(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('car:household.form.residencePercentageHelper')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimaryHousehold"
                    checked={isPrimaryHousehold}
                    onChange={(e) => setIsPrimaryHousehold(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPrimaryHousehold">
                    {t('car:household.form.isPrimaryHousehold')}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custodySchedule">{t('car:household.form.custodySchedule')}</Label>
                <Textarea
                  id="custodySchedule"
                  value={custodySchedule}
                  onChange={(e) => setCustodySchedule(e.target.value)}
                  placeholder='{"weekdays": "mother", "weekends": "father"}'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Enter custody schedule as JSON (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('car:household.form.memberNotes')}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this member..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common:buttons.cancel')}
                </Button>
                <Button onClick={handleUpdateMember}>
                  {t('common:buttons.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
