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
                           <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                           <SelectItem value="Albania">Albania</SelectItem>
                           <SelectItem value="Algeria">Algeria</SelectItem>
                           <SelectItem value="Andorra">Andorra</SelectItem>
                           <SelectItem value="Angola">Angola</SelectItem>
                           <SelectItem value="Antigua and Barbuda">Antigua and Barbuda</SelectItem>
                           <SelectItem value="Argentina">Argentina</SelectItem>
                           <SelectItem value="Armenia">Armenia</SelectItem>
                           <SelectItem value="Australia">Australia</SelectItem>
                           <SelectItem value="Austria">Austria</SelectItem>
                           <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                           <SelectItem value="Bahamas">Bahamas</SelectItem>
                           <SelectItem value="Bahrain">Bahrain</SelectItem>
                           <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                           <SelectItem value="Barbados">Barbados</SelectItem>
                           <SelectItem value="Belarus">Belarus</SelectItem>
                           <SelectItem value="Belgium">Belgium</SelectItem>
                           <SelectItem value="Belize">Belize</SelectItem>
                           <SelectItem value="Benin">Benin</SelectItem>
                           <SelectItem value="Bhutan">Bhutan</SelectItem>
                           <SelectItem value="Bolivia">Bolivia</SelectItem>
                           <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                           <SelectItem value="Botswana">Botswana</SelectItem>
                           <SelectItem value="Brazil">Brazil</SelectItem>
                           <SelectItem value="Brunei">Brunei</SelectItem>
                           <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                           <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                           <SelectItem value="Burundi">Burundi</SelectItem>
                           <SelectItem value="Cabo Verde">Cabo Verde</SelectItem>
                           <SelectItem value="Cambodia">Cambodia</SelectItem>
                           <SelectItem value="Cameroon">Cameroon</SelectItem>
                           <SelectItem value="Canada">Canada</SelectItem>
                           <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                           <SelectItem value="Chad">Chad</SelectItem>
                           <SelectItem value="Chile">Chile</SelectItem>
                           <SelectItem value="China">China</SelectItem>
                           <SelectItem value="Colombia">Colombia</SelectItem>
                           <SelectItem value="Comoros">Comoros</SelectItem>
                           <SelectItem value="Congo">Congo</SelectItem>
                           <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                           <SelectItem value="Croatia">Croatia</SelectItem>
                           <SelectItem value="Cuba">Cuba</SelectItem>
                           <SelectItem value="Cyprus">Cyprus</SelectItem>
                           <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                           <SelectItem value="Denmark">Denmark</SelectItem>
                           <SelectItem value="Djibouti">Djibouti</SelectItem>
                           <SelectItem value="Dominica">Dominica</SelectItem>
                           <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                           <SelectItem value="East Timor">East Timor</SelectItem>
                           <SelectItem value="Ecuador">Ecuador</SelectItem>
                           <SelectItem value="Egypt">Egypt</SelectItem>
                           <SelectItem value="El Salvador">El Salvador</SelectItem>
                           <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                           <SelectItem value="Eritrea">Eritrea</SelectItem>
                           <SelectItem value="Estonia">Estonia</SelectItem>
                           <SelectItem value="Eswatini">Eswatini</SelectItem>
                           <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                           <SelectItem value="Fiji">Fiji</SelectItem>
                           <SelectItem value="Finland">Finland</SelectItem>
                           <SelectItem value="France">France</SelectItem>
                           <SelectItem value="Gabon">Gabon</SelectItem>
                           <SelectItem value="Gambia">Gambia</SelectItem>
                           <SelectItem value="Georgia">Georgia</SelectItem>
                           <SelectItem value="Germany">Germany</SelectItem>
                           <SelectItem value="Ghana">Ghana</SelectItem>
                           <SelectItem value="Greece">Greece</SelectItem>
                           <SelectItem value="Grenada">Grenada</SelectItem>
                           <SelectItem value="Guatemala">Guatemala</SelectItem>
                           <SelectItem value="Guinea">Guinea</SelectItem>
                           <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                           <SelectItem value="Guyana">Guyana</SelectItem>
                           <SelectItem value="Haiti">Haiti</SelectItem>
                           <SelectItem value="Honduras">Honduras</SelectItem>
                           <SelectItem value="Hungary">Hungary</SelectItem>
                           <SelectItem value="Iceland">Iceland</SelectItem>
                           <SelectItem value="India">India</SelectItem>
                           <SelectItem value="Indonesia">Indonesia</SelectItem>
                           <SelectItem value="Iran">Iran</SelectItem>
                           <SelectItem value="Iraq">Iraq</SelectItem>
                           <SelectItem value="Ireland">Ireland</SelectItem>
                           <SelectItem value="Israel">Israel</SelectItem>
                           <SelectItem value="Italy">Italy</SelectItem>
                           <SelectItem value="Jamaica">Jamaica</SelectItem>
                           <SelectItem value="Japan">Japan</SelectItem>
                           <SelectItem value="Jordan">Jordan</SelectItem>
                           <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                           <SelectItem value="Kenya">Kenya</SelectItem>
                           <SelectItem value="Kiribati">Kiribati</SelectItem>
                           <SelectItem value="Kosovo">Kosovo</SelectItem>
                           <SelectItem value="Kuwait">Kuwait</SelectItem>
                           <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                           <SelectItem value="Laos">Laos</SelectItem>
                           <SelectItem value="Latvia">Latvia</SelectItem>
                           <SelectItem value="Lebanon">Lebanon</SelectItem>
                           <SelectItem value="Lesotho">Lesotho</SelectItem>
                           <SelectItem value="Liberia">Liberia</SelectItem>
                           <SelectItem value="Libya">Libya</SelectItem>
                           <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                           <SelectItem value="Lithuania">Lithuania</SelectItem>
                           <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                           <SelectItem value="Madagascar">Madagascar</SelectItem>
                           <SelectItem value="Malawi">Malawi</SelectItem>
                           <SelectItem value="Malaysia">Malaysia</SelectItem>
                           <SelectItem value="Maldives">Maldives</SelectItem>
                           <SelectItem value="Mali">Mali</SelectItem>
                           <SelectItem value="Malta">Malta</SelectItem>
                           <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                           <SelectItem value="Mauritania">Mauritania</SelectItem>
                           <SelectItem value="Mauritius">Mauritius</SelectItem>
                           <SelectItem value="Mexico">Mexico</SelectItem>
                           <SelectItem value="Micronesia">Micronesia</SelectItem>
                           <SelectItem value="Moldova">Moldova</SelectItem>
                           <SelectItem value="Monaco">Monaco</SelectItem>
                           <SelectItem value="Mongolia">Mongolia</SelectItem>
                           <SelectItem value="Montenegro">Montenegro</SelectItem>
                           <SelectItem value="Morocco">Morocco</SelectItem>
                           <SelectItem value="Mozambique">Mozambique</SelectItem>
                           <SelectItem value="Myanmar">Myanmar</SelectItem>
                           <SelectItem value="Namibia">Namibia</SelectItem>
                           <SelectItem value="Nauru">Nauru</SelectItem>
                           <SelectItem value="Nepal">Nepal</SelectItem>
                           <SelectItem value="Netherlands">Netherlands</SelectItem>
                           <SelectItem value="New Zealand">New Zealand</SelectItem>
                           <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                           <SelectItem value="Niger">Niger</SelectItem>
                           <SelectItem value="Nigeria">Nigeria</SelectItem>
                           <SelectItem value="North Korea">North Korea</SelectItem>
                           <SelectItem value="North Macedonia">North Macedonia</SelectItem>
                           <SelectItem value="Norway">Norway</SelectItem>
                           <SelectItem value="Oman">Oman</SelectItem>
                           <SelectItem value="Pakistan">Pakistan</SelectItem>
                           <SelectItem value="Palau">Palau</SelectItem>
                           <SelectItem value="Palestine">Palestine</SelectItem>
                           <SelectItem value="Panama">Panama</SelectItem>
                           <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                           <SelectItem value="Paraguay">Paraguay</SelectItem>
                           <SelectItem value="Peru">Peru</SelectItem>
                           <SelectItem value="Philippines">Philippines</SelectItem>
                           <SelectItem value="Poland">Poland</SelectItem>
                           <SelectItem value="Portugal">Portugal</SelectItem>
                           <SelectItem value="Qatar">Qatar</SelectItem>
                           <SelectItem value="Romania">Romania</SelectItem>
                           <SelectItem value="Russia">Russia</SelectItem>
                           <SelectItem value="Rwanda">Rwanda</SelectItem>
                           <SelectItem value="Saint Kitts and Nevis">Saint Kitts and Nevis</SelectItem>
                           <SelectItem value="Saint Lucia">Saint Lucia</SelectItem>
                           <SelectItem value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</SelectItem>
                           <SelectItem value="Samoa">Samoa</SelectItem>
                           <SelectItem value="San Marino">San Marino</SelectItem>
                           <SelectItem value="Sao Tome and Principe">Sao Tome and Principe</SelectItem>
                           <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                           <SelectItem value="Senegal">Senegal</SelectItem>
                           <SelectItem value="Serbia">Serbia</SelectItem>
                           <SelectItem value="Seychelles">Seychelles</SelectItem>
                           <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                           <SelectItem value="Singapore">Singapore</SelectItem>
                           <SelectItem value="Slovakia">Slovakia</SelectItem>
                           <SelectItem value="Slovenia">Slovenia</SelectItem>
                           <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                           <SelectItem value="Somalia">Somalia</SelectItem>
                           <SelectItem value="South Africa">South Africa</SelectItem>
                           <SelectItem value="South Korea">South Korea</SelectItem>
                           <SelectItem value="South Sudan">South Sudan</SelectItem>
                           <SelectItem value="Spain">Spain</SelectItem>
                           <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                           <SelectItem value="Sudan">Sudan</SelectItem>
                           <SelectItem value="Suriname">Suriname</SelectItem>
                           <SelectItem value="Sweden">Sweden</SelectItem>
                           <SelectItem value="Switzerland">Switzerland</SelectItem>
                           <SelectItem value="Syria">Syria</SelectItem>
                           <SelectItem value="Taiwan">Taiwan</SelectItem>
                           <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                           <SelectItem value="Tanzania">Tanzania</SelectItem>
                           <SelectItem value="Thailand">Thailand</SelectItem>
                           <SelectItem value="Togo">Togo</SelectItem>
                           <SelectItem value="Tonga">Tonga</SelectItem>
                           <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                           <SelectItem value="Tunisia">Tunisia</SelectItem>
                           <SelectItem value="Turkey">Turkey</SelectItem>
                           <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                           <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                           <SelectItem value="Uganda">Uganda</SelectItem>
                           <SelectItem value="Ukraine">Ukraine</SelectItem>
                           <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                           <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                           <SelectItem value="United States">United States</SelectItem>
                           <SelectItem value="Uruguay">Uruguay</SelectItem>
                           <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                           <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                           <SelectItem value="Vatican City">Vatican City</SelectItem>
                           <SelectItem value="Venezuela">Venezuela</SelectItem>
                           <SelectItem value="Vietnam">Vietnam</SelectItem>
                           <SelectItem value="Yemen">Yemen</SelectItem>
                           <SelectItem value="Zambia">Zambia</SelectItem>
                           <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
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