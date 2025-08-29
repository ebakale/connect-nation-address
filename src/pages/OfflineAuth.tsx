import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

const OfflineAuth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useLocalAuth();
  const { isOnline } = useOffline();
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    role: 'admin' | 'police_officer' | 'emergency_operator' | 'citizen' | 'field_agent' | 'registrar' | 'verifier';
    displayName: string;
    badgeNumber: string;
    unit: string;
    rank: string;
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    displayName: '',
    badgeNumber: '',
    unit: '',
    rank: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { session } = await signIn(loginForm.email, loginForm.password);
    if (session) {
      // Navigate based on role
      switch (session.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'police_officer':
        case 'emergency_operator':
          navigate('/police');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      return;
    }

    const profile = {
      display_name: signupForm.displayName || signupForm.email.split('@')[0],
      badge_number: signupForm.badgeNumber,
      unit: signupForm.unit,
      rank: signupForm.rank
    };

    const { user } = await signUp(signupForm.email, signupForm.password, signupForm.role, profile);
    if (user) {
      // Auto-login after signup
      await signIn(signupForm.email, signupForm.password);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@police.gq', password: 'admin123' },
    { role: 'Police Officer', email: 'officer@police.gq', password: 'officer123' },
    { role: 'Emergency Operator', email: 'operator@police.gq', password: 'operator123' },
    { role: 'Citizen', email: 'citizen@demo.gq', password: 'citizen123' }
  ];

  const quickLogin = async (email: string, password: string) => {
    setLoginForm({ email, password });
    const { session } = await signIn(email, password);
    if (session) {
      switch (session.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'police_officer':
        case 'emergency_operator':
          navigate('/police');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p>Initializing offline authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">Connect Nation</h1>
          <p className="text-muted-foreground">Offline Authentication System</p>
          <Badge variant="outline" className={isOnline ? "text-green-700 border-green-200 mt-2" : "text-orange-700 border-orange-200 mt-2"}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'Online Mode' : 'Offline Mode'}
          </Badge>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create New Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        value={signupForm.displayName}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={signupForm.role}
                      onValueChange={(value: typeof signupForm.role) => setSignupForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="police_officer">Police Officer</SelectItem>
                        <SelectItem value="emergency_operator">Emergency Operator</SelectItem>
                        <SelectItem value="field_agent">Field Agent</SelectItem>
                        <SelectItem value="registrar">Registrar</SelectItem>
                        <SelectItem value="verifier">Verifier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {['police_officer', 'emergency_operator', 'field_agent'].includes(signupForm.role) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="badge-number">Badge Number</Label>
                        <Input
                          id="badge-number"
                          value={signupForm.badgeNumber}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, badgeNumber: e.target.value }))}
                          placeholder="Badge #"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          value={signupForm.unit}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="Unit assignment"
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoCredentials.map((cred) => (
              <div key={cred.email} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{cred.role}</p>
                  <p className="text-xs text-muted-foreground">{cred.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickLogin(cred.email, cred.password)}
                >
                  Login
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfflineAuth;