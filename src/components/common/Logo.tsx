import React from 'react';
import { Snowflake } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md'
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSize = {
    sm: 18,
    md: 24,
    lg: 30
  };

  return (
    <div className="flex items-center">
      <Snowflake 
        size={iconSize[size]} 
        className="text-blue-600 mr-2" 
      />
      <span className={`font-bold ${sizeClasses[size]} ${textColor}`}>
        ZE<span className="text-blue-600">FREEZE</span>
      </span>
    </div>
  );
};

export default Logo;