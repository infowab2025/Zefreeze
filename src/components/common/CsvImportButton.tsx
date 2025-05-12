import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CsvImportButtonProps {
  onImport: (file: File) => Promise<void>;
  accept?: string;
  className?: string;
  children?: React.ReactNode;
}

const CsvImportButton: React.FC<CsvImportButtonProps> = ({
  onImport,
  accept = '.csv',
  className = '',
  children
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    try {
      await onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Erreur lors de l\'importation du fichier');
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Upload className="h-4 w-4 mr-2" />
        {children || 'Importer CSV'}
      </button>
    </div>
  );
};

export default CsvImportButton;