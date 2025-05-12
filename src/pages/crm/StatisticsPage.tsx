import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Calendar, Filter, ThermometerSnowflake,
  Fan, ClipboardCheck, Users, CheckCircle,
  AlertTriangle, Clock, Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const StatisticsPage = () => {
  const [timeframe, setTimeframe] = useState('month');

  // Fetch companies for filtering
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      if (error) throw error;
      return data;
    }
  });

  // Get first company ID for initial load
  const firstCompanyId = companies?.[0]?.id;

  // Fetch equipment statistics
  const { data: equipmentStats } = useQuery({
    queryKey: ['statistics', 'equipment', firstCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_company_equipment_summary', {
          company_id: firstCompanyId
        });
      if (error) throw error;
      return data;
    },
    enabled: !!firstCompanyId
  });

  // Fetch intervention statistics
  const { data: interventionStats } = useQuery({
    queryKey: ['statistics', 'interventions', firstCompanyId, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_intervention_stats', {
          company_id: firstCompanyId,
          period: timeframe
        });
      if (error) throw error;
      return data;
    },
    enabled: !!firstCompanyId
  });

  // Fetch compliance statistics
  const { data: complianceStats } = useQuery({
    queryKey: ['statistics', 'compliance', firstCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_compliance_score', {
          company_id: firstCompanyId
        });
      if (error) throw error;
      return data;
    },
    enabled: !!firstCompanyId
  });

  // Colors for charts
  const COLORS = {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  // Equipment type distribution data
  const equipmentTypeData = equipmentStats ? [
    { name: 'Froid', value: equipmentStats.by_type.cold_storage || 0, color: COLORS.blue },
    { name: 'VMC', value: equipmentStats.by_type.vmc || 0, color: COLORS.green },
    { name: 'Autre', value: equipmentStats.by_type.other || 0, color: COLORS.purple }
  ] : [];

  // Equipment status data
  const equipmentStatusData = equipmentStats ? [
    { name: 'Opérationnel', value: equipmentStats.operational || 0, color: COLORS.green },
    { name: 'Maintenance', value: equipmentStats.maintenance_needed || 0, color: COLORS.yellow },
    { name: 'Hors service', value: equipmentStats.out_of_service || 0, color: COLORS.red }
  ] : [];

  // Intervention priority data
  const interventionPriorityData = interventionStats?.by_priority ? [
    { name: 'Haute', value: interventionStats.by_priority.high || 0, color: COLORS.red },
    { name: 'Moyenne', value: interventionStats.by_priority.medium || 0, color: COLORS.yellow },
    { name: 'Basse', value: interventionStats.by_priority.low || 0, color: COLORS.green }
  ] : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600">Analyse des performances et indicateurs clés</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Equipment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Distribution des équipements</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">État des équipements</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intervention Priority */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Priorité des interventions</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interventionPriorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {interventionPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance Scores */}
      {complianceStats && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scores de conformité</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardCheck className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">HACCP</p>
                    <p className="text-2xl font-bold text-green-600">
                      {complianceStats.component_scores.haccp_compliance || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ThermometerSnowflake className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">État équipements</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {complianceStats.component_scores.equipment_status || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Planning maintenance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {complianceStats.component_scores.maintenance_schedule || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Violations */}
      {complianceStats?.recent_violations && complianceStats.recent_violations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Violations récentes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {complianceStats.recent_violations.map((violation, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{violation.equipment_name}</p>
                    <p className="text-sm text-gray-500">{violation.violation_type}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(violation.date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;