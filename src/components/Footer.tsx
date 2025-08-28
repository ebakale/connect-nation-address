import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-primary/20 glass py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-xl bg-white shadow-lg">
              <img src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" alt="BIAKAM Logo" className="h-8 w-auto" />
            </div>
          </div>
          <p className="text-cyan-light font-medium">
            {t('copyrightBiakam')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('footerDescription')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;