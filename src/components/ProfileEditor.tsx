import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Save, Globe, Calendar, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  national_id_type: string;
  national_id: string;
  date_of_birth: string;
  nationality: string;
  preferred_language: string;
}

export const ProfileEditor = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['common']);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    email: "",
    phone: "",
    national_id_type: "passport",
    national_id: "",
    date_of_birth: "",
    nationality: "Equatorial Guinea",
    preferred_language: "es"
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            national_id_type: data.national_id_type || "passport",
            national_id: data.national_id || "",
            date_of_birth: data.date_of_birth || "",
            nationality: data.nationality || "Equatorial Guinea",
            preferred_language: data.preferred_language || "es"
          });
        } else {
          // Set defaults from auth user
          setProfile(prev => ({
            ...prev,
            email: user.email || ""
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          national_id_type: profile.national_id_type,
          national_id: profile.national_id,
          date_of_birth: profile.date_of_birth,
          nationality: profile.nationality,
          preferred_language: profile.preferred_language
        });

      if (profileError) throw profileError;

      // Update email in auth if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });

        if (emailError) throw emailError;
        toast.success('Profile updated! Please check your email to confirm the new address.');
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: "", new: "", confirm: "" });
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div>{t('pleaseLogInToEditProfile')}</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profileInformation')}
          </CardTitle>
          <CardDescription>
            {t('updatePersonalInformation')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder={t('enterFullName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('enterEmail')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneNumber')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('enterPhoneNumber')}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="nationalIdType">{t('nationalIdType')}</Label>
              <Select
                value={profile.national_id_type || "passport"}
                onValueChange={(value) => setProfile(prev => ({ ...prev, national_id_type: value }))}
              >
                <SelectTrigger id="nationalIdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">{t('passport')}</SelectItem>
                  <SelectItem value="national_id">{t('nationalId')}</SelectItem>
                  <SelectItem value="residence_permit">{t('residencePermit')}</SelectItem>
                  <SelectItem value="driver_license">{t('driversLicense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">{t('nationalIdNumber')}</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationalId"
                  type="text"
                  className="pl-10"
                  value={profile.national_id}
                  onChange={(e) => setProfile(prev => ({ ...prev, national_id: e.target.value }))}
                  placeholder={t('enterNationalId')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="pl-10"
                  value={profile.date_of_birth}
                  onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">{t('nationality')}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationality"
                  type="text"
                  className="pl-10"
                  value={profile.nationality}
                  onChange={(e) => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder={t('enterNationality')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">{t('preferredLanguage')}</Label>
              <Select
                value={profile.preferred_language}
                onValueChange={(value) => setProfile(prev => ({ ...prev, preferred_language: value }))}
              >
                <SelectTrigger id="preferredLanguage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t('spanish')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                  <SelectItem value="fr">{t('french')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? t('updating') : t('updateProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            {t('changePassword')}
          </CardTitle>
          <CardDescription className="mt-2">
            {t('updateAccountPassword')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder={t('enterNewPassword')}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder={t('confirmNewPasswordPlaceholder')}
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={passwordLoading || !passwords.new || !passwords.confirm} className="w-full">
              <Lock className="mr-2 h-4 w-4" />
              {passwordLoading ? t('updating') : t('changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};