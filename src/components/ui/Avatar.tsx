import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface AvatarProps {
  name: string;
  callsign?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  callsign,
  src,
  size = 'md',
  isOnline = false,
  className,
}) => {
  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  };

  return (
    <div className={cn('relative inline-flex items-center shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold tracking-wider select-none bg-gradient-to-br from-blue-700 to-indigo-950 text-white border border-blue-400/30 overflow-hidden shadow-inner',
          sizeStyles[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{callsign ? callsign.slice(0, 2) : getInitials(name)}</span>
        )}
      </div>

      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#040812]" />
      )}
    </div>
  );
};
