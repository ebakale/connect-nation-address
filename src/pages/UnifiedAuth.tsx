import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, Shield, Lock, Mail, Wifi, WifiOff, User } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import Footer from '@/components/Footer';

const UnifiedAuth = () => {
  const [loading, setLoading] = useState(false);
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
  const { isPoliceRole, loading: roleLoading } = useUserRole();
  const { t } = useTranslation(); // Using i18next directly

  const navigate = useNavigate();

  useEffect(() => {
    if (user && !roleLoading) {
      navigate(isPoliceRole ? '/police' : '/dashboard', { replace: true });
    }
  }, [user, roleLoading, isPoliceRole, navigate]);

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
    
    const { error } = await signUp(
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
              <h1 className="text-4xl font-bold text-white tracking-tight">ConEG</h1>
              <p className="text-white/80 max-w-md mx-auto leading-relaxed">{t('auth:title')}</p>
              <p className="text-white/60 text-sm">
                {isOnlineMode 
                  ? t('auth:connectedToDatabase') 
                  : t('auth:workingOffline')
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
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:firstName')}</label>
                         <Input
                           placeholder={t('auth:enterFirstName')}
                           className="h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.firstName}
                           onChange={(e) => handleInputChange('firstName', e.target.value)}
                           required
                         />
                       </div>
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:lastName')}</label>
                         <Input
                           placeholder={t('auth:enterLastName')}
                           className="h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.lastName}
                           onChange={(e) => handleInputChange('lastName', e.target.value)}
                           required
                         />
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:phoneNumber')}</label>
                       <Input
                         type="tel"
                         placeholder={t('auth:enterPhoneNumber')}
                         className="h-12 text-base border-2 focus:border-primary transition-colors"
                         value={formData.phoneNumber}
                         onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                         required
                       />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:nationalIdType')}</label>
                         <Select
                           value={formData.nationalIdType}
                           onValueChange={(value: 'id_card' | 'passport') => handleInputChange('nationalIdType', value)}
                         >
                           <SelectTrigger className="h-12 text-base border-2 focus:border-primary transition-colors">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="id_card">{t('auth:idCard')}</SelectItem>
                             <SelectItem value="passport">{t('auth:passport')}</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:nationalId')}</label>
                         <Input
                           type="text"
                           placeholder={t('auth:enterNationalId')}
                           className="h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.nationalId}
                           onChange={(e) => handleInputChange('nationalId', e.target.value)}
                           required
                         />
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                         <label className="text-sm font-semibold text-foreground">{t('auth:dateOfBirth')}</label>
                         <Input
                           type="date"
                           className="h-12 text-base border-2 focus:border-primary transition-colors"
                           value={formData.dateOfBirth}
                           onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                           required
                         />
                       </div>
                     <div className="space-y-3">
                       <label className="text-sm font-semibold text-foreground">{t('auth:nationality')}</label>
                       <Select
                         value={formData.nationality}
                         onValueChange={(value) => handleInputChange('nationality', value)}
                       >
                         <SelectTrigger className="h-12 text-base border-2 focus:border-primary transition-colors">
                           <SelectValue placeholder={t('auth:selectNationality')} />
                         </SelectTrigger>
                         <SelectContent className="max-h-[300px]">
                           <SelectItem value="Afghanistan">{t('countries:afghanistan')}</SelectItem>
                           <SelectItem value="Albania">{t('countries:albania')}</SelectItem>
                           <SelectItem value="Algeria">{t('countries:algeria')}</SelectItem>
                           <SelectItem value="Andorra">{t('countries:andorra')}</SelectItem>
                           <SelectItem value="Angola">{t('countries:angola')}</SelectItem>
                           <SelectItem value="Antigua and Barbuda">{t('countries:antigua_and_barbuda')}</SelectItem>
                           <SelectItem value="Argentina">{t('countries:argentina')}</SelectItem>
                           <SelectItem value="Armenia">{t('countries:armenia')}</SelectItem>
                           <SelectItem value="Australia">{t('countries:australia')}</SelectItem>
                           <SelectItem value="Austria">{t('countries:austria')}</SelectItem>
                           <SelectItem value="Azerbaijan">{t('countries:azerbaijan')}</SelectItem>
                           <SelectItem value="Bahamas">{t('countries:bahamas')}</SelectItem>
                           <SelectItem value="Bahrain">{t('countries:bahrain')}</SelectItem>
                           <SelectItem value="Bangladesh">{t('countries:bangladesh')}</SelectItem>
                           <SelectItem value="Barbados">{t('countries:barbados')}</SelectItem>
                           <SelectItem value="Belarus">{t('countries:belarus')}</SelectItem>
                           <SelectItem value="Belgium">{t('countries:belgium')}</SelectItem>
                           <SelectItem value="Belize">{t('countries:belize')}</SelectItem>
                           <SelectItem value="Benin">{t('countries:benin')}</SelectItem>
                           <SelectItem value="Bhutan">{t('countries:bhutan')}</SelectItem>
                           <SelectItem value="Bolivia">{t('countries:bolivia')}</SelectItem>
                           <SelectItem value="Bosnia and Herzegovina">{t('countries:bosnia_and_herzegovina')}</SelectItem>
                           <SelectItem value="Botswana">{t('countries:botswana')}</SelectItem>
                           <SelectItem value="Brazil">{t('countries:brazil')}</SelectItem>
                           <SelectItem value="Brunei">{t('countries:brunei')}</SelectItem>
                           <SelectItem value="Bulgaria">{t('countries:bulgaria')}</SelectItem>
                           <SelectItem value="Burkina Faso">{t('countries:burkina_faso')}</SelectItem>
                           <SelectItem value="Burundi">{t('countries:burundi')}</SelectItem>
                           <SelectItem value="Cabo Verde">{t('countries:cabo_verde')}</SelectItem>
                           <SelectItem value="Cambodia">{t('countries:cambodia')}</SelectItem>
                           <SelectItem value="Cameroon">{t('countries:cameroon')}</SelectItem>
                           <SelectItem value="Canada">{t('countries:canada')}</SelectItem>
                           <SelectItem value="Central African Republic">{t('countries:central_african_republic')}</SelectItem>
                           <SelectItem value="Chad">{t('countries:chad')}</SelectItem>
                           <SelectItem value="Chile">{t('countries:chile')}</SelectItem>
                           <SelectItem value="China">{t('countries:china')}</SelectItem>
                           <SelectItem value="Colombia">{t('countries:colombia')}</SelectItem>
                           <SelectItem value="Comoros">{t('countries:comoros')}</SelectItem>
                           <SelectItem value="Congo">{t('countries:congo')}</SelectItem>
                           <SelectItem value="Costa Rica">{t('countries:costa_rica')}</SelectItem>
                           <SelectItem value="Croatia">{t('countries:croatia')}</SelectItem>
                           <SelectItem value="Cuba">{t('countries:cuba')}</SelectItem>
                           <SelectItem value="Cyprus">{t('countries:cyprus')}</SelectItem>
                           <SelectItem value="Czech Republic">{t('countries:czech_republic')}</SelectItem>
                           <SelectItem value="Denmark">{t('countries:denmark')}</SelectItem>
                           <SelectItem value="Djibouti">{t('countries:djibouti')}</SelectItem>
                           <SelectItem value="Dominica">{t('countries:dominica')}</SelectItem>
                           <SelectItem value="Dominican Republic">{t('countries:dominican_republic')}</SelectItem>
                           <SelectItem value="East Timor">{t('countries:east_timor')}</SelectItem>
                           <SelectItem value="Ecuador">{t('countries:ecuador')}</SelectItem>
                           <SelectItem value="Egypt">{t('countries:egypt')}</SelectItem>
                           <SelectItem value="El Salvador">{t('countries:el_salvador')}</SelectItem>
                           <SelectItem value="Equatorial Guinea">{t('countries:equatorial_guinea')}</SelectItem>
                           <SelectItem value="Eritrea">{t('countries:eritrea')}</SelectItem>
                           <SelectItem value="Estonia">{t('countries:estonia')}</SelectItem>
                           <SelectItem value="Eswatini">{t('countries:eswatini')}</SelectItem>
                           <SelectItem value="Ethiopia">{t('countries:ethiopia')}</SelectItem>
                           <SelectItem value="Fiji">{t('countries:fiji')}</SelectItem>
                           <SelectItem value="Finland">{t('countries:finland')}</SelectItem>
                           <SelectItem value="France">{t('countries:france')}</SelectItem>
                           <SelectItem value="Gabon">{t('countries:gabon')}</SelectItem>
                           <SelectItem value="Gambia">{t('countries:gambia')}</SelectItem>
                           <SelectItem value="Georgia">{t('countries:georgia')}</SelectItem>
                           <SelectItem value="Germany">{t('countries:germany')}</SelectItem>
                           <SelectItem value="Ghana">{t('countries:ghana')}</SelectItem>
                           <SelectItem value="Greece">{t('countries:greece')}</SelectItem>
                           <SelectItem value="Grenada">{t('countries:grenada')}</SelectItem>
                           <SelectItem value="Guatemala">{t('countries:guatemala')}</SelectItem>
                           <SelectItem value="Guinea">{t('countries:guinea')}</SelectItem>
                           <SelectItem value="Guinea-Bissau">{t('countries:guinea_bissau')}</SelectItem>
                           <SelectItem value="Guyana">{t('countries:guyana')}</SelectItem>
                           <SelectItem value="Haiti">{t('countries:haiti')}</SelectItem>
                           <SelectItem value="Honduras">{t('countries:honduras')}</SelectItem>
                           <SelectItem value="Hungary">{t('countries:hungary')}</SelectItem>
                           <SelectItem value="Iceland">{t('countries:iceland')}</SelectItem>
                           <SelectItem value="India">{t('countries:india')}</SelectItem>
                           <SelectItem value="Indonesia">{t('countries:indonesia')}</SelectItem>
                           <SelectItem value="Iran">{t('countries:iran')}</SelectItem>
                           <SelectItem value="Iraq">{t('countries:iraq')}</SelectItem>
                           <SelectItem value="Ireland">{t('countries:ireland')}</SelectItem>
                           <SelectItem value="Israel">{t('countries:israel')}</SelectItem>
                           <SelectItem value="Italy">{t('countries:italy')}</SelectItem>
                           <SelectItem value="Jamaica">{t('countries:jamaica')}</SelectItem>
                           <SelectItem value="Japan">{t('countries:japan')}</SelectItem>
                           <SelectItem value="Jordan">{t('countries:jordan')}</SelectItem>
                           <SelectItem value="Kazakhstan">{t('countries:kazakhstan')}</SelectItem>
                           <SelectItem value="Kenya">{t('countries:kenya')}</SelectItem>
                           <SelectItem value="Kiribati">{t('countries:kiribati')}</SelectItem>
                           <SelectItem value="Kosovo">{t('countries:kosovo')}</SelectItem>
                           <SelectItem value="Kuwait">{t('countries:kuwait')}</SelectItem>
                           <SelectItem value="Kyrgyzstan">{t('countries:kyrgyzstan')}</SelectItem>
                           <SelectItem value="Laos">{t('countries:laos')}</SelectItem>
                           <SelectItem value="Latvia">{t('countries:latvia')}</SelectItem>
                           <SelectItem value="Lebanon">{t('countries:lebanon')}</SelectItem>
                           <SelectItem value="Lesotho">{t('countries:lesotho')}</SelectItem>
                           <SelectItem value="Liberia">{t('countries:liberia')}</SelectItem>
                           <SelectItem value="Libya">{t('countries:libya')}</SelectItem>
                           <SelectItem value="Liechtenstein">{t('countries:liechtenstein')}</SelectItem>
                           <SelectItem value="Lithuania">{t('countries:lithuania')}</SelectItem>
                           <SelectItem value="Luxembourg">{t('countries:luxembourg')}</SelectItem>
                           <SelectItem value="Madagascar">{t('countries:madagascar')}</SelectItem>
                           <SelectItem value="Malawi">{t('countries:malawi')}</SelectItem>
                           <SelectItem value="Malaysia">{t('countries:malaysia')}</SelectItem>
                           <SelectItem value="Maldives">{t('countries:maldives')}</SelectItem>
                           <SelectItem value="Mali">{t('countries:mali')}</SelectItem>
                           <SelectItem value="Malta">{t('countries:malta')}</SelectItem>
                           <SelectItem value="Marshall Islands">{t('countries:marshall_islands')}</SelectItem>
                           <SelectItem value="Mauritania">{t('countries:mauritania')}</SelectItem>
                           <SelectItem value="Mauritius">{t('countries:mauritius')}</SelectItem>
                           <SelectItem value="Mexico">{t('countries:mexico')}</SelectItem>
                           <SelectItem value="Micronesia">{t('countries:micronesia')}</SelectItem>
                           <SelectItem value="Moldova">{t('countries:moldova')}</SelectItem>
                           <SelectItem value="Monaco">{t('countries:monaco')}</SelectItem>
                           <SelectItem value="Mongolia">{t('countries:mongolia')}</SelectItem>
                           <SelectItem value="Montenegro">{t('countries:montenegro')}</SelectItem>
                           <SelectItem value="Morocco">{t('countries:morocco')}</SelectItem>
                           <SelectItem value="Mozambique">{t('countries:mozambique')}</SelectItem>
                           <SelectItem value="Myanmar">{t('countries:myanmar')}</SelectItem>
                           <SelectItem value="Namibia">{t('countries:namibia')}</SelectItem>
                           <SelectItem value="Nauru">{t('countries:nauru')}</SelectItem>
                           <SelectItem value="Nepal">{t('countries:nepal')}</SelectItem>
                           <SelectItem value="Netherlands">{t('countries:netherlands')}</SelectItem>
                           <SelectItem value="New Zealand">{t('countries:new_zealand')}</SelectItem>
                           <SelectItem value="Nicaragua">{t('countries:nicaragua')}</SelectItem>
                           <SelectItem value="Niger">{t('countries:niger')}</SelectItem>
                           <SelectItem value="Nigeria">{t('countries:nigeria')}</SelectItem>
                           <SelectItem value="North Korea">{t('countries:north_korea')}</SelectItem>
                           <SelectItem value="North Macedonia">{t('countries:north_macedonia')}</SelectItem>
                           <SelectItem value="Norway">{t('countries:norway')}</SelectItem>
                           <SelectItem value="Oman">{t('countries:oman')}</SelectItem>
                           <SelectItem value="Pakistan">{t('countries:pakistan')}</SelectItem>
                           <SelectItem value="Palau">{t('countries:palau')}</SelectItem>
                           <SelectItem value="Palestine">{t('countries:palestine')}</SelectItem>
                           <SelectItem value="Panama">{t('countries:panama')}</SelectItem>
                           <SelectItem value="Papua New Guinea">{t('countries:papua_new_guinea')}</SelectItem>
                           <SelectItem value="Paraguay">{t('countries:paraguay')}</SelectItem>
                           <SelectItem value="Peru">{t('countries:peru')}</SelectItem>
                           <SelectItem value="Philippines">{t('countries:philippines')}</SelectItem>
                           <SelectItem value="Poland">{t('countries:poland')}</SelectItem>
                           <SelectItem value="Portugal">{t('countries:portugal')}</SelectItem>
                           <SelectItem value="Qatar">{t('countries:qatar')}</SelectItem>
                           <SelectItem value="Romania">{t('countries:romania')}</SelectItem>
                           <SelectItem value="Russia">{t('countries:russia')}</SelectItem>
                           <SelectItem value="Rwanda">{t('countries:rwanda')}</SelectItem>
                           <SelectItem value="Saint Kitts and Nevis">{t('countries:saint_kitts_and_nevis')}</SelectItem>
                           <SelectItem value="Saint Lucia">{t('countries:saint_lucia')}</SelectItem>
                           <SelectItem value="Saint Vincent and the Grenadines">{t('countries:saint_vincent_and_the_grenadines')}</SelectItem>
                           <SelectItem value="Samoa">{t('countries:samoa')}</SelectItem>
                           <SelectItem value="San Marino">{t('countries:san_marino')}</SelectItem>
                           <SelectItem value="Sao Tome and Principe">{t('countries:sao_tome_and_principe')}</SelectItem>
                           <SelectItem value="Saudi Arabia">{t('countries:saudi_arabia')}</SelectItem>
                           <SelectItem value="Senegal">{t('countries:senegal')}</SelectItem>
                           <SelectItem value="Serbia">{t('countries:serbia')}</SelectItem>
                           <SelectItem value="Seychelles">{t('countries:seychelles')}</SelectItem>
                           <SelectItem value="Sierra Leone">{t('countries:sierra_leone')}</SelectItem>
                           <SelectItem value="Singapore">{t('countries:singapore')}</SelectItem>
                           <SelectItem value="Slovakia">{t('countries:slovakia')}</SelectItem>
                           <SelectItem value="Slovenia">{t('countries:slovenia')}</SelectItem>
                           <SelectItem value="Solomon Islands">{t('countries:solomon_islands')}</SelectItem>
                           <SelectItem value="Somalia">{t('countries:somalia')}</SelectItem>
                           <SelectItem value="South Africa">{t('countries:south_africa')}</SelectItem>
                           <SelectItem value="South Korea">{t('countries:south_korea')}</SelectItem>
                           <SelectItem value="South Sudan">{t('countries:south_sudan')}</SelectItem>
                           <SelectItem value="Spain">{t('countries:spain')}</SelectItem>
                           <SelectItem value="Sri Lanka">{t('countries:sri_lanka')}</SelectItem>
                           <SelectItem value="Sudan">{t('countries:sudan')}</SelectItem>
                           <SelectItem value="Suriname">{t('countries:suriname')}</SelectItem>
                           <SelectItem value="Sweden">{t('countries:sweden')}</SelectItem>
                           <SelectItem value="Switzerland">{t('countries:switzerland')}</SelectItem>
                           <SelectItem value="Syria">{t('countries:syria')}</SelectItem>
                           <SelectItem value="Taiwan">{t('countries:taiwan')}</SelectItem>
                           <SelectItem value="Tajikistan">{t('countries:tajikistan')}</SelectItem>
                           <SelectItem value="Tanzania">{t('countries:tanzania')}</SelectItem>
                           <SelectItem value="Thailand">{t('countries:thailand')}</SelectItem>
                           <SelectItem value="Togo">{t('countries:togo')}</SelectItem>
                           <SelectItem value="Tonga">{t('countries:tonga')}</SelectItem>
                           <SelectItem value="Trinidad and Tobago">{t('countries:trinidad_and_tobago')}</SelectItem>
                           <SelectItem value="Tunisia">{t('countries:tunisia')}</SelectItem>
                           <SelectItem value="Turkey">{t('countries:turkey')}</SelectItem>
                           <SelectItem value="Turkmenistan">{t('countries:turkmenistan')}</SelectItem>
                           <SelectItem value="Tuvalu">{t('countries:tuvalu')}</SelectItem>
                           <SelectItem value="Uganda">{t('countries:uganda')}</SelectItem>
                           <SelectItem value="Ukraine">{t('countries:ukraine')}</SelectItem>
                           <SelectItem value="United Arab Emirates">{t('countries:united_arab_emirates')}</SelectItem>
                           <SelectItem value="United Kingdom">{t('countries:united_kingdom')}</SelectItem>
                           <SelectItem value="United States">{t('countries:united_states')}</SelectItem>
                           <SelectItem value="Uruguay">{t('countries:uruguay')}</SelectItem>
                           <SelectItem value="Uzbekistan">{t('countries:uzbekistan')}</SelectItem>
                           <SelectItem value="Vanuatu">{t('countries:vanuatu')}</SelectItem>
                           <SelectItem value="Vatican City">{t('countries:vatican_city')}</SelectItem>
                           <SelectItem value="Venezuela">{t('countries:venezuela')}</SelectItem>
                           <SelectItem value="Vietnam">{t('countries:vietnam')}</SelectItem>
                           <SelectItem value="Yemen">{t('countries:yemen')}</SelectItem>
                           <SelectItem value="Zambia">{t('countries:zambia')}</SelectItem>
                           <SelectItem value="Zimbabwe">{t('countries:zimbabwe')}</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
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