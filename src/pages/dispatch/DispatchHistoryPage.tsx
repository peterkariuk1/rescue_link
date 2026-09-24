import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';

export function DispatchHistoryPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const cases = useMemo(() => {
    let list = mockService.getEmergencyCases().filter((c) => ['completed', 'cancelled'].includes(c.status));
    if (search) list = list.filter((c) => c.case_reference.toLowerCase().includes(search.toLowerCase()));
    if (triageFilter) list = list.filter((c) => c.triage_category === triageFilter);
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    if (dateFrom) list = list.filter((c) => new Date(c.created_time) >= new Date(dateFrom));
    if (dateTo) list = list.filter((c) => new Date(c.created_time) <= new Date(dateTo + 'T23:59:59'));
    return list;
  }, [search, triageFilter, statusFilter, dateFrom, dateTo]);

  const handleExport = () => {
    toast('success', 'Export started. Your file will download shortly (mock).');
  };

  return (
    <div>
      <PageHeader
        title="Dispatch History"
        description="Search and review completed and cancelled emergency dispatches."
        breadcrumbs={[{ label: 'Paramedic Dispatch' }, { label: 'Dispatch History' }]}
        actions={<Button variant="secondary" onClick={handleExport}><Download size={16} /> Export</Button>}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by case ID..." />
          </div>
          <select className="input sm:w-40" value={triageFilter} onChange={(e) => setTriageFilter(e.target.value)}>
            <option value="">All Triage</option>
            {triageCategories.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input sm:w-40" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input sm:w-40" />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Case ID</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Triage</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Hospital</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Created</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Completed</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Dispatcher</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const triage = triageCategories.find((t) => t.id === c.triage_category);
                const hospital = c.assigned_hospital_id ? mockService.getHospitalById(c.assigned_hospital_id) : null;
                return (
                  <tr key={c.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                    <td className="px-4 py-3 text-sm font-medium text-navy-800">{c.case_reference}</td>
                    <td className="px-4 py-3"><Badge variant={triage?.color === 'triage-red' ? 'triage-red' : triage?.color === 'triage-orange' ? 'triage-orange' : 'info'}>{triage?.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-navy-500">{hospital?.name || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-sm text-navy-400">{new Date(c.created_time).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-navy-400">{new Date(c.updated_time).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{c.dispatcher_name}</td>
                    <td className="px-4 py-3"><div className="flex justify-end"><Link to={`/dispatch/cases/${c.id}`} className="p-1.5 rounded text-navy-500 hover:bg-navy-50"><Eye size={16} /></Link></div></td>
                  </tr>
                );
              })}
              {cases.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-sm text-navy-400">No dispatch history found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
