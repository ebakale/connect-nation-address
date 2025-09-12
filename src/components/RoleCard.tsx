import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

// Import role-specific images
import policeOfficerImage from "@/assets/police-officer-eg.jpg";
import emergencyServicesImage from "@/assets/emergency-services-eg.jpg";
import fieldAgentImage from "@/assets/field-agent-eg.jpg";
import citizenMobileImage from "@/assets/citizen-mobile-eg.jpg";
import documentVerificationImage from "@/assets/document-verification.jpg";

interface RoleCardProps {
  roleKey: string;
  title: string;
  description: string;
  features: string[];
  onNavigate: (path: string) => void;
  navigationPath: string;
  variant?: 'police' | 'emergency' | 'citizen' | 'field' | 'admin';
}

const RoleCard: React.FC<RoleCardProps> = ({
  roleKey,
  title,
  description,
  features,
  onNavigate,
  navigationPath,
  variant = 'citizen'
}) => {
  const { t } = useTranslation(['common', 'dashboard', 'auth']);

  const getImageForVariant = (variant: string) => {
    switch (variant) {
      case 'police':
        return policeOfficerImage;
      case 'emergency':
        return emergencyServicesImage;
      case 'field':
        return fieldAgentImage;
      case 'admin':
        return documentVerificationImage;
      default:
        return citizenMobileImage;
    }
  };

  const getGradientForVariant = (variant: string) => {
    switch (variant) {
      case 'police':
        return 'from-destructive/90 via-destructive/40 to-transparent';
      case 'emergency':
        return 'from-destructive/90 via-destructive/40 to-transparent';
      case 'field':
        return 'from-secondary/90 via-secondary/40 to-transparent';
      case 'admin':
        return 'from-primary/90 via-primary/40 to-transparent';
      default:
        return 'from-primary/90 via-primary/40 to-transparent';
    }
  };

  const getShadowForVariant = (variant: string) => {
    switch (variant) {
      case 'police':
      case 'emergency':
        return 'hover:shadow-red';
      case 'field':
        return 'hover:shadow-green';
      case 'admin':
        return 'hover:shadow-blue';
      default:
        return 'hover:shadow-blue';
    }
  };

  return (
    <Card className={`group overflow-hidden border-2 shadow-card ${getShadowForVariant(variant)} transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
      {/* Hero Image Section */}
      <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${getImageForVariant(variant)})` }}>
        <div className={`absolute inset-0 bg-gradient-to-t ${getGradientForVariant(variant)}`}></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-sm">
              {roleKey}
            </Badge>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{t('common:platform.keyFeatures')}:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onNavigate(navigationPath)}
          className="w-full mt-4"
          variant={variant === 'police' || variant === 'emergency' ? 'destructive' : 'default'}
        >
          {t('common:platform.accessDashboard')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleCard;