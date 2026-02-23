import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualHelpProps {
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function ContextualHelp({ content, className, side = 'top' }: ContextualHelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground', className)}
          type="button"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Help</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
