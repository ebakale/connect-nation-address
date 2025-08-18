import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Main page is always accessible regardless of authentication status

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'about', label: 'About Us', icon: Users },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'manual', label: 'Manual', icon: Book },
    { id: 'login', label: 'Login', icon: LogIn },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="px-4 py-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  National Address System
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Equatorial Guinea Address Registry
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  The official digital platform for registering, verifying, and managing addresses across Equatorial Guinea. 
                  Building a comprehensive national address infrastructure for better service delivery and development.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Address Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Find and verify existing addresses using our comprehensive search system with geolocation support.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address Registration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Register new addresses with precise coordinates, photos, and detailed information for official recognition.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Verification System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Multi-tier verification process ensuring accuracy and authenticity of all registered addresses.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Role-Based Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Different access levels for citizens, field agents, verifiers, registrars, and administrators.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Official Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate official address certificates and documentation for legal and administrative purposes.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Geographic Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Complete coverage of all provinces including Djibloho, Kié-Ntem, Bioko Norte, and more.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Objectives Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Our Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">National Infrastructure</h3>
                    <p className="text-muted-foreground">
                      Build a comprehensive digital address infrastructure that supports government services, 
                      emergency response, and economic development.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Service Delivery</h3>
                    <p className="text-muted-foreground">
                      Improve delivery of postal services, utilities, healthcare, and other essential services 
                      through accurate address information.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Economic Growth</h3>
                    <p className="text-muted-foreground">
                      Support business development and e-commerce by providing reliable address data 
                      for logistics and customer service.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Data Accuracy</h3>
                    <p className="text-muted-foreground">
                      Maintain high-quality, verified address data through rigorous validation processes 
                      and continuous updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">About Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The Equatorial Guinea Address Registry is a government initiative to modernize 
                the country's address infrastructure and improve service delivery nationwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To create a comprehensive, accurate, and accessible national address system that 
                    serves as the foundation for improved public services, economic development, 
                    and quality of life for all citizens of Equatorial Guinea.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To be the leading digital address infrastructure in Central Africa, enabling 
                    efficient service delivery, supporting business growth, and connecting every 
                    location in Equatorial Guinea to the digital economy.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Key Partners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Ministry of Interior</h3>
                    <p className="text-sm text-muted-foreground">Government oversight and policy</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Local Governments</h3>
                    <p className="text-sm text-muted-foreground">Provincial implementation</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Technology Partners</h3>
                    <p className="text-sm text-muted-foreground">Platform development and maintenance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Help & Support</h2>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions and get assistance with using the platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">How do I register a new address?</h4>
                    <p className="text-sm text-muted-foreground">
                      Log in to your account, navigate to "Add Address", fill in the required information 
                      including coordinates, and submit for verification.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">How long does verification take?</h4>
                    <p className="text-sm text-muted-foreground">
                      Address verification typically takes 3-5 business days, depending on location 
                      and complexity of the submission.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Can I update an existing address?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, you can request updates to existing addresses. Changes must be verified 
                      by authorized personnel before being approved.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Email Support</h4>
                    <p className="text-sm text-muted-foreground">support@addressregistry.gq</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">+240 XXX XXX XXX</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Office Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 8:00 AM - 5:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">User Manual</h2>
              <p className="text-lg text-muted-foreground">
                Step-by-step guide to using the Equatorial Guinea Address Registry.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. Account Registration</h4>
                    <p className="text-sm text-muted-foreground">
                      Create an account using your email address and a secure password. 
                      Verify your email to activate your account.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">2. Profile Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete your profile with accurate personal information. 
                      This helps us verify your identity for address submissions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Address Registration Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 1: Location Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Select the correct province and city, then provide street and building details.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 2: Coordinates</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the "Get Current Location" button or manually enter GPS coordinates. 
                      Accurate coordinates are essential for verification.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 3: Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload a clear photo of the location and provide any additional description 
                      that helps identify the address.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 4: Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit your request for review. Field agents will verify the location 
                      and registrars will approve the final address code.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>User Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Citizens</h4>
                      <p className="text-sm text-muted-foreground">
                        Can search for addresses, submit new address requests, and view their submissions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Field Agents</h4>
                      <p className="text-sm text-muted-foreground">
                        Verify address locations on-site and approve or reject submissions based on field visits.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Verifiers</h4>
                      <p className="text-sm text-muted-foreground">
                        Review field agent reports and conduct additional verification if needed.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Registrars</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate official UAC codes and publish verified addresses to the national registry.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Access Your Account</h2>
              <p className="text-muted-foreground">
                Sign in to submit address requests, track your submissions, and access the registry.
              </p>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">Login Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  To access the address registry features, you need to create an account or sign in 
                  with your existing credentials.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full"
                  variant="hero"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login Page
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">New User?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  Don't have an account yet? The registration process is quick and secure.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Free account registration</li>
                  <li>• Secure email verification</li>
                  <li>• Immediate access to search features</li>
                  <li>• Submit address registration requests</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">EG Address Registry</span>
            </div>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 whitespace-nowrap transition-colors ${
                    activeSection === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Republic of Equatorial Guinea - Address Registry System</p>
            <p className="text-sm mt-2">Building the future of address infrastructure in Equatorial Guinea</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;