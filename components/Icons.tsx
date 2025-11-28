import React from 'react';
import { Building2, Atom, BookOpen, GraduationCap, ExternalLink, RefreshCw } from 'lucide-react';

export const IconBuilding = ({ className }: { className?: string }) => <Building2 className={className} />;
export const IconAtom = ({ className }: { className?: string }) => <Atom className={className} />;
export const IconBook = ({ className }: { className?: string }) => <BookOpen className={className} />;
export const IconSchool = ({ className }: { className?: string }) => <GraduationCap className={className} />;
export const IconLink = ({ className }: { className?: string }) => <ExternalLink className={className} />;
export const IconRefresh = ({ className }: { className?: string }) => <RefreshCw className={className} />;

export const getIcon = (name: string, className?: string) => {
  switch (name) {
    case 'Building': return <IconBuilding className={className} />;
    case 'Atom': return <IconAtom className={className} />;
    case 'BookOpen': return <IconBook className={className} />;
    case 'School': return <IconSchool className={className} />;
    default: return <IconBuilding className={className} />;
  }
};
