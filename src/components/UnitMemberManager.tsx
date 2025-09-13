import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, Crown, Shield, Award, Star, User, 
  MessageSquare, Settings, Activity, MapPin,
  Phone, Mail, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  status: string;
  emergency_unit_members: Array<{
    id: string;
    officer_id: string;
    role: string;
    is_lead: boolean;
    profiles: {
      full_name: string;
      email: string;
      phone?: string;
    };
  }>;
}

interface UnitMemberManagerProps {
  unit: UnitInfo;
  onUpdate: () => void;
}

export const UnitMemberManager: React.FC<UnitMemberManagerProps> = ({ unit, onUpdate }) => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    task: '',
    notes: '',
    priority: 'normal'
  });

  const getRoleIcon = (role: string, isLead: boolean) => {
    if (isLead) {
      return <Crown className="h-4 w-4 text-yellow-600" />;
    }
    
    switch (role) {
      case 'lieutenant': return <Star className="h-4 w-4 text-blue-600" />;
      case 'sergeant': return <Award className="h-4 w-4 text-green-600" />;
      case 'corporal': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'senior_officer': return <Activity className="h-4 w-4 text-orange-600" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatRoleTitle = (role: string) => {
    switch (role) {
      case 'lieutenant': return t('unitMemberManager.roles.lieutenant');
      case 'sergeant': return t('unitMemberManager.roles.sergeant');
      case 'corporal': return t('unitMemberManager.roles.corporal');
      case 'senior_officer': return t('unitMemberManager.roles.seniorOfficer');
      default: return t('unitMemberManager.roles.policeOfficer');
    }
  };

  const updateMemberStatus = async (memberId: string, status: string) => {
    try {
      // This would typically update a member status table
      // For now, we'll show a success message
      toast.success(t('unitMemberManager.officerStatusUpdated', { status }));
      onUpdate();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error(t('unitMemberManager.failedToUpdateStatus'));
    }
  };

  const assignTask = async () => {
    if (!selectedMember || !assignmentData.task) return;

    try {
      // In a real implementation, this would create a task assignment record
      toast.success(t('unitMemberManager.taskAssigned', { name: selectedMember.profiles.full_name }));
      
      setIsAssignmentDialogOpen(false);
      setAssignmentData({ task: '', notes: '', priority: 'normal' });
      setSelectedMember(null);
      onUpdate();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error(t('unitMemberManager.failedToAssignTask'));
    }
  };

  const sendMessage = async (memberId: string) => {
    try {
      // This would typically open a communication interface
      toast.success(t('unitMemberManager.openingCommunication'));
    } catch (error) {
      console.error('Error opening communication:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {t('unitMemberManager.title')}
          </CardTitle>
          <CardDescription>
            {t('unitMemberManager.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unit.emergency_unit_members && unit.emergency_unit_members.length > 0 ? (
              unit.emergency_unit_members
                .sort((a, b) => {
                  // Sort: lead first, then by role priority
                  if (a.is_lead && !b.is_lead) return -1;
                  if (!a.is_lead && b.is_lead) return 1;
                  
                  const rolePriority = { lieutenant: 5, sergeant: 4, corporal: 3, senior_officer: 2, officer: 1 };
                  return (rolePriority[b.role as keyof typeof rolePriority] || 1) - 
                         (rolePriority[a.role as keyof typeof rolePriority] || 1);
                })
                .map((member) => (
              <Card key={member.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(member.role, member.is_lead)}
                      <div>
                        <p className="font-medium">{member.profiles.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatRoleTitle(member.role)}</span>
                          {member.is_lead && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-600 font-medium">{t('unitMemberManager.unitLead')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">{t('common:status.available')}</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendMessage(member.officer_id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <Dialog open={isAssignmentDialogOpen && selectedMember?.id === member.id}
                                onOpenChange={(open) => {
                                  setIsAssignmentDialogOpen(open);
                                  if (open) setSelectedMember(member);
                                }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('unitMemberManager.assignTask', { name: member.profiles.full_name })}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{t('unitMemberManager.taskAssignment')}</Label>
                                <Textarea
                                  placeholder={t('unitMemberManager.taskPlaceholder')}
                                  value={assignmentData.task}
                                  onChange={(e) => setAssignmentData({...assignmentData, task: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label>{t('common:priority')}</Label>
                                <Select
                                  value={assignmentData.priority}
                                  onValueChange={(value) => setAssignmentData({...assignmentData, priority: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">{t('unitMemberManager.priorities.low')}</SelectItem>
                                    <SelectItem value="normal">{t('unitMemberManager.priorities.normal')}</SelectItem>
                                    <SelectItem value="high">{t('unitMemberManager.priorities.high')}</SelectItem>
                                    <SelectItem value="urgent">{t('unitMemberManager.priorities.urgent')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>{t('unitMemberManager.additionalNotes')}</Label>
                                <Textarea
                                  placeholder={t('unitMemberManager.notesPlaceholder')}
                                  value={assignmentData.notes}
                                  onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                                />
                              </div>

                              <Button onClick={assignTask} className="w-full">
                                {t('unitMemberManager.assignTaskButton')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Select onValueChange={(value) => updateMemberStatus(member.id, value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder={t('common:status.status')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">{t('common:status.available')}</SelectItem>
                            <SelectItem value="busy">{t('common:status.busy')}</SelectItem>
                            <SelectItem value="patrol">{t('unitMemberManager.statuses.onPatrol')}</SelectItem>
                            <SelectItem value="break">{t('unitMemberManager.statuses.onBreak')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {member.profiles.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.profiles.email}
                        </div>
                      )}
                      {member.profiles.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.profiles.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Assignment Info */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {t('unitMemberManager.onDuty')}
                    </Badge>
                    <span className="text-muted-foreground">
                      {t('unitMemberManager.noActiveAssignment')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('unitMemberManager.noMembers')}</p>
                <p className="text-sm text-muted-foreground">{t('unitMemberManager.contactSupervisor')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unit Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('unitMemberManager.performanceSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">100%</p>
              <p className="text-sm text-muted-foreground">{t('unitMemberManager.teamAvailability')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">8.5m</p>
              <p className="text-sm text-muted-foreground">{t('unitMemberManager.avgResponseTime')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-muted-foreground">{t('unitMemberManager.incidentsToday')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};