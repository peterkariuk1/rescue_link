import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { mockService } from '@/services/mockService';
import { triageCategories, caseStatusLabels } from '@/data/mockData';
import type { CaseStatus, TriageCategory } from '@/types';

export function EmergencyCasesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');

  const cases = useMemo(() => {
    let list = mockService.getEmergencyCases();
    if (search) list = list.filter((c) => c.case_reference.toLowerCase().includes(search.toLowerCase()) || c.emergency_description.toLowerCase().includes(search.toLowerCase()));
    if (triageFilter) list = list.filter((c) => c.triage_category === triageFilter);
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    if (hospitalFilter) list = list.filter((c) => c.assigned_hospital_id === hospitalFilter);
    return list;
  }, [search, triageFilter, statusFilter, hospitalFilter]);

  const hospitals = mockService.getActiveHospitals();

  return (
    <div>
      <PageHeader
        title="Emergency Cases"
        description="Search and manage all emergency cases."
        breadcrumbs={[{ label: 'Paramedic Dispatch' }, { label: 'Emergency Cases' }]}
        actions={<Link to="/dispatch/new-case" className="btn-primary"><Plus size={16} /> New Emergency Case</Link>}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by case ID or description..." />
          </div>
          <select className="input sm:w-40" value={triageFilter} onChange={(e) => setTriageFilter(e.target.value)}>
            <option value="">All Triage</option>
            {triageCategories.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(caseStatusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <select className="input sm:w-44" value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="">All Hospitals</option>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
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
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Hospital</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Ambulance</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Created</th>
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
                    <td className="px-4 py-3 text-sm font-medium text-navy-800">{c.case_reference}</td>
                    <td className="px-4 py-3"><Badge variant={triage?.color === 'triage-red' ? 'triage-red' : triage?.color === 'triage-orange' ? 'triage-orange' : triage?.color === 'triage-yellow' ? 'triage-yellow' : triage?.color === 'triage-light-green' ? 'triage-light-green' : 'triage-green'}>{triage?.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-navy-500 max-w-[150px] truncate">{c.location_address || `${c.patient_latitude.toFixed(2)}, ${c.patient_longitude.toFixed(2)}`}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-sm text-navy-500">{hospital?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{ambulance?.identifier || '—'}</td>
                    <td className="px-4 py-3 text-sm text-navy-400">{new Date(c.created_time).toLocaleString()}</td>
                    <td className="px-4 py-3"><div className="flex justify-end"><button className="p-1.5 rounded text-navy-500 hover:bg-navy-50"><Eye size={16} /></button></div></td>
                  </tr>
                );
              })}
              {cases.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-sm text-navy-400">No emergency cases found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
