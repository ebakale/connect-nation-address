import React from 'react';

interface SectionTransitionProps {
  children: React.ReactNode;
  sectionKey: string;
}

export function SectionTransition({ children, sectionKey }: SectionTransitionProps) {
  return (
    <div
      key={sectionKey}
      className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {children}
    </div>
  );
}