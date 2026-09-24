import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Ambulance, AlertTriangle, Clock, Plus, Activity } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/Feedback';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { mockService } from '@/services/mockService';
import { triageCategories, caseStatusLabels } from '@/data/mockData';

export function DispatchDashboard() {
  const cases = mockService.getEmergencyCases();
  const hospitals = mockService.getActiveHospitals();
  const totalAmbulances = hospitals.reduce((acc, h) => acc + h.ambulances.filter((a) => a.status === 'available').length, 0);

  const activeCases = cases.filter((c) => !['completed', 'cancelled'].includes(c.status));
  const pendingMatches = cases.filter((c) => c.status === 'matching' || c.status === 'awaiting_confirmation');
  const dispatched = cases.filter((c) => ['dispatched', 'in_transit'].includes(c.status));
  const awaitingConf = cases.filter((c) => c.status === 'awaiting_confirmation');
  const critical = cases.filter((c) => c.triage_category === 'pure_red' && !['completed', 'cancelled'].includes(c.status));

  const severityData = useMemo(() => {
    return triageCategories.map((t) => ({
      ...t,
      count: cases.filter((c) => c.triage_category === t.id && !['completed', 'cancelled'].includes(c.status)).length,
    }));
  }, [cases]);

  return (
    <div>
      <PageHeader
        title="Dispatch Dashboard"
        description="Real-time emergency dispatch operations overview."
        breadcrumbs={[{ label: 'Paramedic Dispatch' }, { label: 'Dashboard' }]}
        actions={<Link to="/dispatch/new-case" className="btn-primary"><Plus size={16} /> New Emergency Case</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard label="Active Cases" value={activeCases.length} icon={<Siren size={20} />} color="danger" />
        <KPICard label="Pending Matches" value={pendingMatches.length} icon={<AlertTriangle size={20} />} color="warning" />
        <KPICard label="Dispatched" value={dispatched.length} icon={<Ambulance size={20} />} color="accent" />
        <KPICard label="Awaiting Confirm" value={awaitingConf.length} icon={<Clock size={20} />} color="warning" />
        <KPICard label="Available Ambulances" value={totalAmbulances} icon={<Ambulance size={20} />} color="success" />
        <KPICard label="Critical Cases" value={critical.length} icon={<AlertTriangle size={20} />} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Active Emergency Queue</CardTitle></CardHeader>
          <CardBody className="p-0">
            {activeCases.length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-8">No active emergency cases.</p>
            ) : (
              <div className="divide-y divide-navy-50/50">
                {activeCases.slice(0, 6).map((c) => {
                  const triage = triageCategories.find((t) => t.id === c.triage_category);
                  const hospital = c.assigned_hospital_id ? mockService.getHospitalById(c.assigned_hospital_id) : null;
                  return (
                    <Link key={c.id} to={`/dispatch/cases/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-navy-50/30 transition-colors">
                      <div className={`w-2 h-10 rounded-full bg-${triage?.color || 'triage-yellow'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-navy-800">{c.case_reference}</p>
                          <Badge variant={triage?.color === 'triage-red' ? 'danger' : triage?.color === 'triage-orange' ? 'warning' : 'info'}>
                            {triage?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-navy-400 truncate">{c.emergency_description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={c.status} />
                        {hospital && <p className="text-xs text-navy-400 mt-1">{hospital.name}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Emergency Severity Overview</CardTitle></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {severityData.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${s.color}`} />
                  <span className="text-sm text-navy-600 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-navy-950">{s.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Emergency Cases</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-navy-50/50">
              {cases.slice(0, 5).map((c) => {
                const triage = triageCategories.find((t) => t.id === c.triage_category);
                return (
                  <Link key={c.id} to={`/dispatch/cases/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-navy-50/30">
                    <Activity size={16} className="text-navy-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-800">{c.case_reference}</p>
                      <p className="text-xs text-navy-400 truncate">{c.emergency_description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={triage?.color === 'triage-red' ? 'danger' : triage?.color === 'triage-orange' ? 'warning' : 'info'}>{triage?.label}</Badge>
                      <p className="text-xs text-navy-300 mt-1">{new Date(c.created_time).toLocaleTimeString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dispatch Activity</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-navy-50/50">
              {mockService.getActivityLogs().filter((a) => a.role === 'paramedic').slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                    <Activity size={14} className="text-navy-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800">{a.action}</p>
                    <p className="text-xs text-navy-400 truncate">{a.description}</p>
                    <p className="text-[10px] text-navy-300 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
