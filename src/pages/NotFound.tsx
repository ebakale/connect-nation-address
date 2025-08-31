import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative">
      <div className="absolute top-4 right-4">
        
      </div>
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">{t('oopsPageNotFound')}</p>
        <Button 
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('returnToHome')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
