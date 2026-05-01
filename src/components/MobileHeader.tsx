import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, LogOut, User, ArrowLeft } from 'lucide-react';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  onSignIn?: () => void;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'ConEG',
  subtitle,
  userName,
  isAuthenticated,
  onSignOut,
  onSignIn,
  onBack,
  rightContent,
}) => {
  return (
    <header className="gov-header-light sticky top-safe z-40">
      <div className="flex justify-between items-center h-12 px-3 sm:px-4">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <Button variant="ghost" size="icon-sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="p-1 bg-primary/10 rounded-lg shrink-0">
              <img 
                src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                alt="BIAKAM Logo" 
                className="h-5 w-auto" 
              />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground leading-tight truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Status + Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <OfflineIndicator />
          <Badge variant="success" className="hidden sm:flex text-[10px] px-1.5 py-0.5">
            <Shield className="h-2.5 w-2.5 mr-0.5" />
            Secure
          </Badge>
          {rightContent}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground truncate max-w-[80px] hidden sm:inline">
                {userName}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onSignOut}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : onSignIn ? (
            <Button onClick={onSignIn} size="sm" className="h-8 text-xs px-3">
              <User className="h-3.5 w-3.5 mr-1" />
              Login
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
