import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, Clock, Siren } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';

export function ActiveDispatchesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const cases = useMemo(() => {
    let list = mockService.getEmergencyCases().filter((c) => !['completed', 'cancelled'].includes(c.status));
    if (search) list = list.filter((c) => c.case_reference.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [search, statusFilter]);

  const elapsed = (time: string) => {
    const diff = Date.now() - new Date(time).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div>
      <PageHeader
        title="Active Dispatches"
        description="Live monitoring of all active emergency dispatches."
        breadcrumbs={[{ label: 'Paramedic Dispatch' }, { label: 'Active Dispatches' }]}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by case ID..." />
          </div>
          <select className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="ambulance_assigned">Ambulance Assigned</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived">Arrived</option>
            <option value="hospital_confirmed">Hospital Confirmed</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Case ID</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Triage</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Hospital</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Ambulance</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Elapsed</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Last Update</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const triage = triageCategories.find((t) => t.id === c.triage_category);
                const hospital = c.assigned_hospital_id ? mockService.getHospitalById(c.assigned_hospital_id) : null;
                const ambulance = hospital?.ambulances.find((a) => a.id === c.assigned_ambulance_id);
                return (
                  <tr key={c.id} className="border-b border-navy-50/50 hover:bg-navy-50/30 cursor-pointer" onClick={() => navigate(`/dispatch/cases/${c.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-navy-800 flex items-center gap-2">
                      {triage?.priority === 1 && <Siren size={14} className="text-triage-red animate-pulse" />}
                      {c.case_reference}
                    </td>
                    <td className="px-4 py-3"><Badge variant={triage?.color === 'triage-red' ? 'triage-red' : triage?.color === 'triage-orange' ? 'triage-orange' : 'info'}>{triage?.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-navy-500 max-w-[120px] truncate">{c.location_address || `${c.patient_latitude.toFixed(2)}, ${c.patient_longitude.toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{hospital?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{ambulance?.identifier || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><span className="text-sm font-medium text-navy-700 flex items-center gap-1"><Clock size={12} />{elapsed(c.created_time)}</span></td>
                    <td className="px-4 py-3 text-sm text-navy-400">{new Date(c.updated_time).toLocaleTimeString()}</td>
                    <td className="px-4 py-3"><div className="flex justify-end"><button className="p-1.5 rounded text-navy-500 hover:bg-navy-50"><Eye size={16} /></button></div></td>
                  </tr>
                );
              })}
              {cases.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-sm text-navy-400">No active dispatches.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
