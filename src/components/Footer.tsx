import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border py-8 mt-auto">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <img 
                src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                alt="BIAKAM Logo" 
                className="h-6 w-auto" 
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">ConEG Platform</p>
              <p className="text-xs text-muted-foreground">
                {t('common:footer.description')}
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Government Secured System</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            {t('common:footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
