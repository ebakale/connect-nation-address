import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Globe, Shield, Lock, Mail, Wifi, WifiOff, User, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import Footer from '@/components/Footer';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const UnifiedAuth = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    confirmPassword: '',
    nationalIdType: 'id_card' as 'id_card' | 'passport',
    nationalId: '',
    dateOfBirth: '',
    nationality: 'Equatorial Guinea',
    preferredLanguage: 'es',
    role: 'citizen' as 'admin' | 'police_officer' | 'emergency_operator' | 'citizen' | 'field_agent' | 'registrar' | 'verifier',
    badgeNumber: '',
    unit: '',
    rank: ''
  });
  
  const { signIn, signUp, user, isOnlineMode } = useUnifiedAuth();
  const { signInWithGoogle, resetPassword } = useAuth();
  const { isPoliceRole, isPostalRole, loading: roleLoading } = useUserRole();
  const { t } = useTranslation();

  const navigate = useNavigate();

  useEffect(() => {
    if (user && !roleLoading) {
      if (isPoliceRole) {
        navigate('/police', { replace: true });
      } else if (isPostalRole) {
        navigate('/postal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, roleLoading, isPoliceRole, isPostalRole, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(formData.email, formData.password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setLoading(true);
    
    await signUp(
      formData.email, 
      formData.password, 
      formData.firstName,
      formData.lastName,
      formData.phoneNumber,
      formData.nationalIdType,
      formData.nationalId,
      formData.dateOfBirth,
      formData.nationality,
      formData.preferredLanguage,
      formData.role
    );
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    if (!error) {
      setShowPasswordReset(false);
      setResetEmail('');
    }
    setLoading(false);
  };

  // Countries list for nationality selection
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
    'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
    'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
    'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 'Guinea-Bissau',
    'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
    'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
    'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
    'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay',
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
    'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
    'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-4 sm:px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('common:buttons.back')}
          </Button>
          
          <Badge 
            variant={isOnlineMode ? "success" : "warning"}
            className="gap-1.5"
          >
            {isOnlineMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnlineMode ? t('common:status.active') : t('common:status.inactive')}
          </Badge>
          
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Branding */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-card border border-border">
              <Globe className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ConEG</h1>
              <p className="text-muted-foreground">{t('auth:title')}</p>
              <p className="text-sm text-muted-foreground">
                {isOnlineMode 
                  ? t('auth:connectedToDatabase') 
                  : t('auth:workingOffline')
                }
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="shadow-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                {t('auth:secureAccess')}
              </CardTitle>
              <CardDescription>
                {isOnlineMode ? t('auth:accessNationalSystem') : t('auth:offlineAccess')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              {showPasswordReset ? (
                // Password Reset Form
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordReset(false)}
                    className="text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t('auth:backToSignIn')}
                  </Button>
                  
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">{t('auth:resetPassword')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('auth:resetPasswordDescription')}
                    </p>
                  </div>
                  
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('auth:email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder={t('common:placeholders.enterEmail')}
                          className="pl-10 h-11"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11" 
                      disabled={loading}
                    >
                      {loading ? t('auth:sending') : t('auth:sendResetLink')}
                    </Button>
                  </form>
                </div>
              ) : (
                // Main Auth Forms
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-10 mb-6">
                    <TabsTrigger value="signin" className="text-sm">{t('auth:signIn')}</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm">{t('auth:signUp')}</TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="signin" className="space-y-4 mt-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('auth:email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={t('common:placeholders.enterEmail')}
                            className="pl-10 h-11"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('auth:password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder={t('common:placeholders.enterPassword')}
                            className="pl-10 h-11"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm text-primary p-0 h-auto"
                          onClick={() => setShowPasswordReset(true)}
                        >
                          {t('auth:forgotPassword')}
                        </Button>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11" 
                        disabled={loading}
                      >
                        {loading ? t('auth:signingIn') : t('auth:signIn')}
                      </Button>
                    </form>
                    
                    {/* Social Login Divider */}
                    {isOnlineMode && (
                      <>
                        <div className="relative my-6">
                          <Separator />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                            {t('auth:orContinueWith')}
                          </span>
                        </div>
                        
                        {/* Google Sign In Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 gap-2"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                        >
                          <GoogleIcon />
                          {t('auth:signInWith', { provider: 'Google' })}
                        </Button>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:firstName')}</Label>
                          <Input
                            placeholder={t('auth:enterFirstName')}
                            className="h-11"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:lastName')}</Label>
                          <Input
                            placeholder={t('auth:enterLastName')}
                            className="h-11"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('auth:phoneNumber')}</Label>
                        <Input
                          type="tel"
                          placeholder={t('auth:enterPhoneNumber')}
                          className="h-11"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:nationalIdType')}</Label>
                          <Select
                            value={formData.nationalIdType}
                            onValueChange={(value: 'id_card' | 'passport') => handleInputChange('nationalIdType', value)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="id_card">{t('auth:idCard')}</SelectItem>
                              <SelectItem value="passport">{t('auth:passport')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:nationalId')}</Label>
                          <Input
                            type="text"
                            placeholder={t('auth:enterNationalId')}
                            className="h-11"
                            value={formData.nationalId}
                            onChange={(e) => handleInputChange('nationalId', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:dateOfBirth')}</Label>
                          <Input
                            type="date"
                            className="h-11"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:nationality')}</Label>
                          <Select
                            value={formData.nationality}
                            onValueChange={(value) => handleInputChange('nationality', value)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={t('auth:selectNationality')} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('auth:email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={t('common:placeholders.enterEmail')}
                            className="pl-10 h-11"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:password')}</Label>
                          <Input
                            type="password"
                            placeholder={t('common:placeholders.enterPassword')}
                            className="h-11"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('auth:confirmPassword')}</Label>
                          <Input
                            type="password"
                            placeholder={t('auth:confirmYourPassword')}
                            className="h-11"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('auth:preferredLanguage')}</Label>
                        <Select
                          value={formData.preferredLanguage}
                          onValueChange={(value) => handleInputChange('preferredLanguage', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">{t('common:languages.spanish')}</SelectItem>
                            <SelectItem value="en">{t('common:languages.english')}</SelectItem>
                            <SelectItem value="fr">{t('common:languages.french')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11" 
                        disabled={loading}
                      >
                        {loading ? t('auth:creatingAccount') : t('auth:createAccount')}
                      </Button>
                    </form>
                    
                    {/* Social Login Divider for Sign Up */}
                    {isOnlineMode && (
                      <>
                        <div className="relative my-6">
                          <Separator />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                            {t('auth:orContinueWith')}
                          </span>
                        </div>
                        
                        {/* Google Sign Up Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 gap-2"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                        >
                          <GoogleIcon />
                          {t('auth:signUpWith', { provider: 'Google' })}
                        </Button>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
          {/* Help Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth:needHelp')}{' '}
            <a href="mailto:support@coneg.gq" className="text-primary hover:underline">
              {t('auth:contactSupport')}
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnifiedAuth;
