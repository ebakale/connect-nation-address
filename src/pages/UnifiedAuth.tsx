import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, Shield, Lock, Mail, Wifi, WifiOff, User } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import Footer from '@/components/Footer';

const UnifiedAuth = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    role: 'citizen' as 'admin' | 'police_officer' | 'emergency_operator' | 'citizen' | 'field_agent' | 'registrar' | 'verifier',
    badgeNumber: '',
    unit: '',
    rank: ''
  });
  
  const { signIn, signUp, user, isOnlineMode } = useUnifiedAuth();
  const { isPoliceRole, loading: roleLoading } = useUserRole();
  const { t } = useTranslation(); // Using i18next directly

  if (user) {
    if (roleLoading) return null;
    return <Navigate to={isPoliceRole ? '/police' : '/dashboard'} replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setLoading(true);
    
    if (isOnlineMode) {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
    } else {
      // For offline mode, pass additional profile data
      const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.role);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Header with Language Switcher and Connection Status */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-center">
                <Badge 
                  variant="outline" 
                  className={`px-4 py-2 text-sm font-medium shadow-lg ${
                    isOnlineMode 
                      ? "text-emerald-700 border-emerald-200 bg-emerald-50/80" 
                      : "text-orange-700 border-orange-200 bg-orange-50/80"
                  } backdrop-blur-sm`}
                >
                  {isOnlineMode ? <Wifi className="w-3 h-3 mr-2" /> : <WifiOff className="w-3 h-3 mr-2" />}
                  {isOnlineMode ? t('common:status.active') : t('common:status.inactive')}
                </Badge>
              </div>
            </div>
            
            {/* Language Switcher */}
            <div className="ml-4">
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-card border border-white/20 animate-glow-pulse">
              <Globe className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">ConnectEG</h1>
              <p className="text-white/80 max-w-md mx-auto leading-relaxed">{t('auth:title')}</p>
              <p className="text-white/60 text-sm">
                {isOnlineMode 
                  ? 'Connected to national database' 
                  : 'Working offline - data will sync when connected'
                }
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="shadow-card bg-white/95 backdrop-blur-sm border-0 animate-scale-in">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
              <CardTitle className="flex items-center justify-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                {t('auth:secureAccess')}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isOnlineMode ? t('auth:accessNationalSystem') : t('auth:offlineAccess')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12">
                  <TabsTrigger value="signin" className="text-sm font-medium">{t('auth:signIn')}</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm font-medium">{t('auth:signUp')}</TabsTrigger>
                </TabsList>
              
                <TabsContent value="signin" className="space-y-6 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">{t('auth:email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder={t('common:placeholders.enterEmail')}
                          className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">{t('auth:password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder={t('common:placeholders.enterPassword')}
                          className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-card" 
                      disabled={loading}
                    >
                      {loading ? t('auth:signingIn') : t('auth:signIn')}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-6 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-6">
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:fullName')}</label>
                       <Input
                         placeholder={t('auth:enterFullName')}
                         className="h-12 text-base border-2 focus:border-primary transition-colors"
                         value={formData.fullName}
                         onChange={(e) => handleInputChange('fullName', e.target.value)}
                         required
                       />
                     </div>
                     
                     {!isOnlineMode && (
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:role')}</label>
                         <Select
                            value={formData.role}
                            onValueChange={(value: typeof formData.role) => handleInputChange('role', value)}
                          >
                            <SelectTrigger className="h-12 text-base border-2 focus:border-primary transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="citizen">{t('auth:roles.citizen')}</SelectItem>
                              <SelectItem value="police_officer">{t('auth:roles.police_officer')}</SelectItem>
                              <SelectItem value="emergency_operator">{t('auth:roles.emergency_operator')}</SelectItem>
                              <SelectItem value="field_agent">{t('auth:roles.field_agent')}</SelectItem>
                              <SelectItem value="registrar">{t('auth:roles.registrar')}</SelectItem>
                              <SelectItem value="verifier">{t('auth:roles.verifier')}</SelectItem>
                              <SelectItem value="admin">{t('auth:roles.admin')}</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                     )}
                     
                     {!isOnlineMode && ['police_officer', 'emergency_operator', 'field_agent'].includes(formData.role) && (
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                           <label className="text-sm font-semibold text-foreground">{t('auth:badgeNumber')}</label>
                           <Input
                             placeholder={t('auth:badgePlaceholder')}
                             className="h-12 text-base border-2 focus:border-primary transition-colors"
                             value={formData.badgeNumber}
                             onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                           />
                         </div>
                         <div className="space-y-3">
                           <label className="text-sm font-semibold text-foreground">{t('auth:unit')}</label>
                           <Input
                             placeholder={t('auth:unitPlaceholder')}
                             className="h-12 text-base border-2 focus:border-primary transition-colors"
                             value={formData.unit}
                             onChange={(e) => handleInputChange('unit', e.target.value)}
                           />
                         </div>
                       </div>
                     )}
                    
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:email')}</label>
                       <div className="relative">
                         <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                         <Input
                           type="email"
                           placeholder={t('common:placeholders.enterEmail')}
                           className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.email}
                           onChange={(e) => handleInputChange('email', e.target.value)}
                           required
                         />
                       </div>
                     </div>
                    
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:password')}</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                         <Input
                           type="password"
                           placeholder={t('auth:createPassword')}
                           className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.password}
                           onChange={(e) => handleInputChange('password', e.target.value)}
                           required
                         />
                       </div>
                     </div>
                    
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:confirmPassword')}</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                         <Input
                           type="password"
                           placeholder={t('auth:confirmYourPassword')}
                           className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.confirmPassword}
                           onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                           required
                         />
                       </div>
                     </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-card" 
                      disabled={loading || formData.password !== formData.confirmPassword}
                    >
                      {loading ? t('auth:creatingAccount') : t('auth:createAccount')}
                    </Button>
                  </form>
                 </TabsContent>
               </Tabs>
             </CardContent>
           </Card>

           {/* Demo Credentials for Offline Mode */}
           {!isOnlineMode && (
             <Card className="shadow-card bg-white/95 backdrop-blur-sm border-0">
                 <CardHeader className="pb-4">
                   <CardTitle className="text-sm flex items-center gap-2">
                     <User className="h-4 w-4" />
                     {t('auth:demoCredentials')}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {[
                     { role: t('auth:roles.admin'), email: 'admin@police.gq', password: 'admin123' },
                     { role: t('auth:roles.police_officer'), email: 'officer@police.gq', password: 'officer123' },
                     { role: t('auth:roles.emergency_operator'), email: 'operator@police.gq', password: 'operator123' },
                     { role: t('auth:roles.citizen'), email: 'citizen@demo.gq', password: 'citizen123' }
                   ].map((cred) => (
                     <div key={cred.email} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                       <div>
                         <p className="font-medium text-sm">{cred.role}</p>
                         <p className="text-xs text-muted-foreground">{cred.email}</p>
                       </div>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => {
                           setFormData(prev => ({ ...prev, email: cred.email, password: cred.password }));
                           handleSignIn({ preventDefault: () => {} } as React.FormEvent);
                         }}
                         className="text-xs"
                       >
                         {t('auth:quickLogin')}
                       </Button>
                     </div>
                   ))}
                 </CardContent>
             </Card>
           )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UnifiedAuth;