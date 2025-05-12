import { useState } from 'react';
import { parseCsvFile, validateCsvHeaders, validateCsvRow } from '../utils/csvParser';
import { toast } from 'react-hot-toast';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface UseCsvImportOptions {
  requiredHeaders: string[];
  validateRow?: (row: Record<string, string>) => boolean;
  onImport: (data: Record<string, string>[]) => Promise<void>;
}

export const useCsvImport = ({
  requiredHeaders,
  validateRow,
  onImport
}: UseCsvImportOptions) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const rows = await parseCsvFile(file);
      const headers = rows[0];

      // Validate headers
      if (!validateCsvHeaders(headers, requiredHeaders)) {
        throw new Error(`En-têtes requis : ${requiredHeaders.join(', ')}`);
      }

      // Process data rows
      const data: Record<string, string>[] = [];
      const errors: string[] = [];
      let success = 0;
      let failed = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!validateCsvRow(row, headers)) {
          errors.push(`Ligne ${i + 1}: Données invalides ou manquantes`);
          failed++;
          continue;
        }

        // Create object from row
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = row[index];
          return obj;
        }, {} as Record<string, string>);

        // Additional validation if provided
        if (validateRow && !validateRow(rowData)) {
          errors.push(`Ligne ${i + 1}: Validation échouée`);
          failed++;
          continue;
        }

        data.push(rowData);
        success++;
      }

      // Import valid data
      if (data.length > 0) {
        await onImport(data);
      }

      setImportResult({ success, failed, errors });

      if (success > 0) {
        toast.success(`${success} élément(s) importé(s) avec succès`);
      }
      if (failed > 0) {
        toast.error(`${failed} élément(s) non importé(s)`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'importation');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importResult,
    handleImport
  };
};