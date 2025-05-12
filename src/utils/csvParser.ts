export const parseCsvFile = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => 
          row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        );
        resolve(rows);
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier CSV'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
};

export const validateCsvHeaders = (headers: string[], requiredHeaders: string[]): boolean => {
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  return requiredHeaders.every(required => 
    normalizedHeaders.includes(required.toLowerCase())
  );
};

export const validateCsvRow = (row: string[], headers: string[]): boolean => {
  return row.length === headers.length && row.every(cell => cell !== '');
};