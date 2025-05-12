import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ComplianceCheckItemProps {
  label: string;
  isCompliant: boolean | null;
  icon?: React.ReactNode;
  description?: string;
  onChange?: (value: boolean) => void;
  readOnly?: boolean;
}

const ComplianceCheckItem: React.FC<ComplianceCheckItemProps> = ({
  label,
  isCompliant,
  icon,
  description,
  onChange,
  readOnly = false
}) => {
  const handleClick = () => {
    if (!readOnly && onChange) {
      onChange(!isCompliant);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${
        isCompliant === null
          ? 'border-gray-200 bg-gray-50'
          : isCompliant
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
      } ${!readOnly ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{label}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div>
          {isCompliant === null ? (
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          ) : isCompliant ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceCheckItem;