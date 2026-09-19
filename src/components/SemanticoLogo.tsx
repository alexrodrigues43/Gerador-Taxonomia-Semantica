import React from 'react';

interface SemanticoLogoProps {
  className?: string;
  height?: number;
}

export const SemanticoLogo: React.FC<SemanticoLogoProps> = ({ className = 'h-9', height = 36 }) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`} title="Semântico - Significado e Sentido">
      <img
        src="/logo-semantico.svg"
        alt="Semântico - Significado e Sentido"
        style={{ height: `${height}px`, width: 'auto' }}
        className="object-contain"
      />
    </div>
  );
};
