import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Search, FileText, MapPin, Phone, Camera, Map, Shield, BarChart3, 
  CheckCircle, ChevronRight, ChevronLeft, Sparkles, Building2, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
}

const citizenSteps: OnboardingStep[] = [
  { icon: Sparkles, title: 'Welcome to ConEG', description: 'Your digital address system. Let\'s walk through the key features available to you.' },
  { icon: FileText, title: 'Register an Address', description: 'Submit a new address request for your residence or business. You\'ll be guided through each step.' , action: 'unified-address-request' },
  { icon: Search, title: 'Search Addresses', description: 'Look up any registered address by UAC code, street name, or city.', action: 'address-search' },
  { icon: MapPin, title: 'My Addresses', description: 'View and manage all addresses linked to your profile.', action: 'citizen-address-portal' },
  { icon: Phone, title: 'Emergency Contacts', description: 'Access emergency services quickly using your registered address.', action: 'emergency-contacts' },
];

const fieldAgentSteps: OnboardingStep[] = [
  { icon: Sparkles, title: 'Welcome, Field Agent', description: 'You\'re set up to capture and verify addresses in the field.' },
  { icon: Camera, title: 'Capture Addresses', description: 'Use your device camera and GPS to capture new address data on-site.', action: 'capture-address' },
  { icon: FileText, title: 'My Drafts', description: 'Review and submit address drafts you\'ve captured, even while offline.', action: 'field-drafts' },
  { icon: Map, title: 'Field Map', description: 'View your assigned areas and navigate to capture locations.', action: 'field-map' },
];

const adminSteps: OnboardingStep[] = [
  { icon: Sparkles, title: 'Welcome, Administrator', description: 'You have full access to manage the address system.' },
  { icon: Shield, title: 'Admin Panel', description: 'Manage users, roles, and system configuration.', action: 'admin' },
  { icon: BarChart3, title: 'Analytics', description: 'View system-wide statistics, coverage maps, and trends.', action: 'analytics' },
  { icon: CheckCircle, title: 'Verification Queue', description: 'Review and approve pending address submissions.', action: 'verification-queue' },
];

const verifierSteps: OnboardingStep[] = [
  { icon: Sparkles, title: 'Welcome, Verifier', description: 'You\'re responsible for reviewing address submissions in your area.' },
  { icon: CheckCircle, title: 'Verification Queue', description: 'Review pending address requests and approve or reject them.', action: 'verification-queue' },
  { icon: Search, title: 'Search & Verify', description: 'Look up existing addresses to cross-reference submissions.', action: 'address-search' },
];

const registrarSteps: OnboardingStep[] = [
  { icon: Sparkles, title: 'Welcome, Registrar', description: 'You manage the official address registry for your jurisdiction.' },
  { icon: Building2, title: 'Registrar Dashboard', description: 'View your jurisdiction overview and pending tasks.', action: 'registrar-dashboard' },
  { icon: CheckCircle, title: 'Publishing Queue', description: 'Review verified addresses and publish them to the national registry.', action: 'publishing-queue' },
];

export const OnboardingWalkthrough = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
  const { user } = useAuth();
  const { role, loading, isAdmin, isFieldAgent, isVerifier, isRegistrar, isCitizen } = useUserRole();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const storageKey = user ? `onboarding_completed_${user.id}` : null;

  useEffect(() => {
    if (loading || !user || !storageKey) return;
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, user, storageKey]);

  const steps = isAdmin ? adminSteps 
    : isRegistrar ? registrarSteps
    : isVerifier ? verifierSteps
    : isFieldAgent ? fieldAgentSteps 
    : citizenSteps;

  const handleComplete = () => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    setOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleGoToAction = () => {
    const step = steps[currentStep];
    if (step.action && onNavigate) {
      onNavigate(step.action);
      handleComplete();
    }
  };

  // Public method to re-trigger
  const triggerOnboarding = () => {
    setCurrentStep(0);
    setOpen(true);
  };

  // Expose trigger via custom event
  useEffect(() => {
    const handler = () => triggerOnboarding();
    window.addEventListener('show-onboarding', handler);
    return () => window.removeEventListener('show-onboarding', handler);
  }, []);

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} / {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-muted-foreground">
              Skip tour
            </Button>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mt-3">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-6 space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center",
            currentStep === 0 
              ? "bg-gradient-to-br from-primary/20 to-primary/5" 
              : "bg-primary/10"
          )}>
            <StepIcon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-sm max-w-xs">
            {step.description}
          </DialogDescription>
          {step.action && (
            <Button variant="link" size="sm" onClick={handleGoToAction} className="text-primary">
              Go there now →
            </Button>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack} 
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="sm" onClick={handleNext} className="gap-1">
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWalkthrough;
