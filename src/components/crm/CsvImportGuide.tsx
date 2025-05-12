import React from 'react';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface CsvImportGuideProps {
  type: 'companies' | 'equipment' | 'users';
}

const CsvImportGuide: React.FC<CsvImportGuideProps> = ({ type }) => {
  const getHeaders = () => {
    switch (type) {
      case 'companies':
        return ['name', 'address', 'phone', 'email'];
      case 'equipment':
        return ['name', 'type', 'brand', 'model', 'serial_number', 'installation_date', 'company_name'];
      case 'users':
        return ['name', 'email', 'phone', 'role', 'company_name'];
      default:
        return [];
    }
  };

  const getExample = () => {
    switch (type) {
      case 'companies':
        return 'Restaurant Le Provençal,123 Rue de Paris 75001 Paris,+33123456789,contact@leprovencal.fr';
      case 'equipment':
        return 'Chambre froide positive,cold_storage,Carrier,XR500,CF123456,2025-01-15,Restaurant Le Provençal';
      case 'users':
        return 'Jean Dupont,jean@leprovencal.fr,+33123456783,client,Restaurant Le Provençal';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Format du fichier CSV</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>Le fichier doit contenir les colonnes suivantes :</p>
          <code className="block bg-blue-100 p-2 rounded">
            {getHeaders().join(',')}
          </code>
          <p>Exemple :</p>
          <code className="block bg-blue-100 p-2 rounded">
            {getExample()}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          Instructions importantes
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Utilisez la virgule (,) comme séparateur</li>
          <li>Encodage UTF-8 recommandé</li>
          <li>Première ligne = noms des colonnes</li>
          <li>Pas d'espaces avant/après les valeurs</li>
          {type === 'equipment' && (
            <>
              <li>Types valides : cold_storage, vmc, other</li>
              <li>Date au format YYYY-MM-DD</li>
            </>
          )}
          {type === 'users' && (
            <li>Rôles valides : admin, technician, client</li>
          )}
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Points d'attention
        </h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Vérifiez que toutes les données sont correctes</li>
          <li>Les lignes invalides seront ignorées</li>
          {(type === 'equipment' || type === 'users') && (
            <li>L'entreprise doit exister dans le système</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <a 
          href={`/templates/${type}-template.csv`}
          download
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <FileText className="h-4 w-4 mr-1" />
          Télécharger le modèle CSV
        </a>
      </div>
    </div>
  );
};

export default CsvImportGuide;