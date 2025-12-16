import React from 'react';
import { DemoScriptDocument } from '@/components/demo/DemoScriptDocument';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const DemoScriptPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            to="/documentation" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Documentation</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <DemoScriptDocument />
    </div>
  );
};
