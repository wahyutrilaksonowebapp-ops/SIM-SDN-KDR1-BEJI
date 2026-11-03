import React from 'react';

export const PASURUAN_LOGO_BW_SRC = '/assets/aistudio/Logo_Kab_Pas_BW_0fc057c7.png';

export interface LogoPasuruanProps {
  className?: string;
  size?: number;
  width?: number | string;
  height?: number | string;
  alt?: string;
}

export const LogoPasuruan: React.FC<LogoPasuruanProps> = ({ 
  className = "w-14 h-16 object-contain", 
  size,
  width,
  height,
  alt = "Lambang Kabupaten Pasuruan"
}) => {
  const finalWidth = width ?? size;
  const finalHeight = height ?? (size ? Math.round(size * 1.2) : undefined);

  return (
    <img
      src={PASURUAN_LOGO_BW_SRC}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={`inline-block shrink-0 object-contain select-none print:contrast-125 ${className}`}
      loading="eager"
    />
  );
};
