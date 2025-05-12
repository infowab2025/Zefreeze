import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEquipment } from '../../hooks/useEquipment';
import { format } from 'date-fns';
import { ThermometerSnowflake, Fan, Settings, Calendar, PenTool as Tool, AlertTriangle, CheckCircle, Clock, ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';

const EquipmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEquipment, updateEquipmentStatus } = useEquipment();
  const { data: equipment, isLoading } = getEquipment(id || '');

  const statusColors = {
    operational: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} /> },
    maintenance_needed: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} /> },
    out_of_service: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle size={16} /> },
  };

  const typeIcons = {
    cold_storage: <ThermometerSnowflake className="h-6 w-6 text-blue-500" />,
    vmc: <Fan className="h-6 w-6 text-green-500" />,
    other: <Settings className="h-6 w-6 text-purple-500" />,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Équipement non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/dashboard/equipment"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
              <p className="text-gray-600">ID: {equipment.id}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1 flex items-center">
                    {typeIcons[equipment.type]}
                    <span className="ml-2 text-gray-900">
                      {equipment.type === 'cold_storage' ? 'Froid commercial' :
                       equipment.type === 'vmc' ? 'VMC' : 'Autre'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[equipment.status].bg
                    } ${statusColors[equipment.status].text}`}>
                      {statusColors[equipment.status].icon}
                      <span className="ml-1.5">
                        {equipment.status === 'operational' ? 'Opérationnel' :
                         equipment.status === 'maintenance_needed' ? 'Maintenance requise' : 'Hors service'}
                      </span>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Marque</label>
                  <p className="mt-1 text-gray-900">{equipment.brand}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Modèle</label>
                  <p className="mt-1 text-gray-900">{equipment.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Numéro de série</label>
                  <p className="mt-1 text-gray-900">{equipment.serialNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date d'installation</label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(equipment.installationDate), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Spécifications techniques</h2>
            </div>
            <div className="p-6">
              {equipment.specifications.temperature && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Température</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500">Minimum</label>
                      <p className="mt-1 text-xl font-semibold text-blue-700">
                        {equipment.specifications.temperature.min}°C
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500">Maximum</label>
                      <p className="mt-1 text-xl font-semibold text-blue-700">
                        {equipment.specifications.temperature.max}°C
                      </p>
                    </div>
                    {equipment.specifications.temperature.current && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-500">Actuelle</label>
                        <p className="mt-1 text-xl font-semibold text-blue-700">
                          {equipment.specifications.temperature.current}°C
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {equipment.specifications.power && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Puissance</h3>
                  <p className="text-gray-900">{equipment.specifications.power} kW</p>
                </div>
              )}

              {equipment.specifications.dimensions && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Dimensions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Largeur</label>
                      <p className="mt-1 text-gray-900">
                        {equipment.specifications.dimensions.width} cm
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Hauteur</label>
                      <p className="mt-1 text-gray-900">
                        {equipment.specifications.dimensions.height} cm
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Profondeur</label>
                      <p className="mt-1 text-gray-900">
                        {equipment.specifications.dimensions.depth} cm
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Historique de maintenance</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {equipment.maintenanceHistory.map((maintenance) => (
                <div key={maintenance.id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Tool className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {maintenance.type === 'repair' ? 'Réparation' :
                           maintenance.type === 'maintenance' ? 'Maintenance' : 'Inspection'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(maintenance.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{maintenance.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Technicien: {maintenance.technician.name}
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Coût: {maintenance.cost.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Localisation</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Site</label>
                  <p className="mt-1 text-gray-900">{equipment.location.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse</label>
                  <p className="mt-1 text-gray-900">{equipment.location.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Planning maintenance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dernière maintenance
                  </label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(equipment.lastMaintenanceDate), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Prochaine maintenance
                  </label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(equipment.nextMaintenanceDate), 'dd/MM/yyyy')}
                  </p>
                </div>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailsPage;