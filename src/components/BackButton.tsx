
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Upload</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );
};
