import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Import professional images
import heroImage from '@/assets/hero-address-system.jpg';
import featureSearch from '@/assets/feature-address-search.jpg';
import featureRegistration from '@/assets/feature-address-registration.jpg';
import featureVerification from '@/assets/feature-address-verification.jpg';

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
          <div className="space-y-16">
            {/* Hero Section */}
            <div 
              className="relative min-h-[70vh] flex items-center justify-center text-center bg-cover bg-center rounded-2xl overflow-hidden"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              {/* Light overlay for text readability */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
              
              <div className="relative z-10 space-y-8 px-6 max-w-5xl">
                <div className="space-y-6 animate-fade-in">
                  <Badge className="px-6 py-2 text-base bg-system-blue text-white">
                    <MapPin className="h-4 w-4 mr-2" />
                    National Address Registry
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                    Equatorial Guinea
                    <br />
                    Address Registration System
                  </h1>
                  
                  <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                    A comprehensive digital platform for registering, verifying, and managing 
                    addresses across all provinces. Improving service delivery and supporting 
                    national development through accurate location data.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button 
                      onClick={() => navigate('/auth')} 
                      className="px-8 py-3 text-lg bg-system-blue hover:bg-system-blue/90"
                      size="lg"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Access System
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('about')}
                      variant="outline" 
                      className="px-8 py-3 text-lg border-system-green text-system-green hover:bg-system-green hover:text-white"
                      size="lg"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  Key Features
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Modern tools and workflows for efficient address management
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="card-hover shadow-card overflow-hidden">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${featureSearch})` }}>
                    <div className="h-full bg-gradient-to-t from-card/90 to-transparent flex items-end p-6">
                      <div className="flex items-center gap-3">
                        <Search className="h-6 w-6 text-system-blue" />
                        <span className="text-xl font-semibold">Address Search</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      Quick and accurate address lookup with advanced filtering and 
                      geolocation capabilities for efficient address management.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover shadow-card overflow-hidden">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${featureRegistration})` }}>
                    <div className="h-full bg-gradient-to-t from-card/90 to-transparent flex items-end p-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-system-green" />
                        <span className="text-xl font-semibold">Address Registration</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      Streamlined registration process with GPS coordinates, 
                      photo documentation, and standardized address formatting.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover shadow-card overflow-hidden">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${featureVerification})` }}>
                    <div className="h-full bg-gradient-to-t from-card/90 to-transparent flex items-end p-6">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-system-blue" />
                        <span className="text-xl font-semibold">Address Verification</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      Multi-level verification process ensuring data accuracy 
                      and compliance with national addressing standards.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-system-green" />
                      Role Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Comprehensive role-based access control with different 
                      permission levels for administrators, registrars, and field agents.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-system-blue" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Generate official certificates, reports, and documentation 
                      with digital signatures and verification codes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-system-green" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Comprehensive analytics and reporting for tracking 
                      registration progress and system performance metrics.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Objectives Section */}
            <Card className="shadow-card">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold gradient-text">
                  System Objectives
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-4">
                  Supporting national development through accurate addressing
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-6 bg-system-blue/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-system-blue" />
                      <h3 className="font-bold text-xl">Improve Service Delivery</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Enable better public service delivery through accurate 
                      addressing for postal services, emergency response, and utilities.
                    </p>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-system-green/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-system-green" />
                      <h3 className="font-bold text-xl">Support Economic Growth</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Facilitate business development and e-commerce through 
                      reliable address infrastructure and location services.
                    </p>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-system-green/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6 text-system-green" />
                      <h3 className="font-bold text-xl">Data-Driven Planning</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Provide accurate location data for urban planning, 
                      infrastructure development, and resource allocation.
                    </p>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-system-blue/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-system-blue" />
                      <h3 className="font-bold text-xl">Ensure Data Quality</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Maintain high standards of data accuracy and integrity 
                      through rigorous verification and validation processes.
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
                {user ? (
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full"
                    variant="hero"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="w-full"
                    variant="hero"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Login Page
                  </Button>
                )}
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
    <div className="min-h-screen bg-gradient-hero relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-cyan/20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-success/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full bg-warning/20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-primary/20 sticky top-0 glass backdrop-blur-xl z-50 shadow-glow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-primary glow-pulse">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-gradient">EG Digital Registry</span>
            </div>
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="glass hover:shadow-neon transition-all duration-300"
                variant="outline"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                className="glass hover:shadow-neon glow-pulse transition-all duration-300"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Enter System
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-primary/20 glass">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'login') {
                      user ? navigate('/dashboard') : navigate('/auth');
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 py-6 px-4 border-b-2 whitespace-nowrap transition-all duration-300 animate-fade-in ${
                    activeSection === item.id
                      ? 'border-primary text-primary shadow-glow text-neon'
                      : 'border-transparent text-muted-foreground hover:text-cyan hover:border-cyan/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`h-4 w-4 ${activeSection === item.id ? 'glow-pulse' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 glass py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-gradient-primary glow-pulse">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <p className="text-cyan-light font-medium">
              &copy; 2024 Republic of Equatorial Guinea - Next-Gen Address Registry
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by Advanced AI • Secured by Quantum Encryption • Built for the Future
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;