import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, UserCheck, Ambulance, Siren, Activity,
  Users, ShieldAlert, TrendingUp, Plus, Eye, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/Feedback';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';

export function SuperAdminDashboard() {
  const hospitals = mockService.getHospitals();
  const paramedics = mockService.getParamedics();
  const cases = mockService.getEmergencyCases();
  const activity = mockService.getActivityLogs();

  const stats = useMemo(() => ({
    totalHospitals: hospitals.length,
    activeHospitals: hospitals.filter((h) => h.partner_status === 'active').length,
    suspendedHospitals: hospitals.filter((h) => h.partner_status === 'suspended').length,
    pendingApprovals: paramedics.filter((p) => p.status === 'pending').length,
    totalAmbulances: hospitals.reduce((acc, h) => acc + h.ambulances.length, 0),
    availableAmbulances: hospitals.reduce(
      (acc, h) => acc + h.ambulances.filter((a) => a.status === 'available').length, 0
    ),
    activeCases: cases.filter((c) => !['completed', 'cancelled'].includes(c.status)).length,
  }), [hospitals, paramedics, cases]);

  const pendingParamedics = paramedics.filter((p) => p.status === 'pending');
  const recentActivity = activity.slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform-wide operational overview and system health."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Dashboard' }]}
        actions={
          <>
            <Link to="/admin/hospitals" className="btn-secondary">
              <Building2 size={16} /> View Partners
            </Link>
            <Link to="/admin/approvals" className="btn-primary">
              <UserCheck size={16} /> Review Approvals
            </Link>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Health Partners" value={stats.totalHospitals} icon={<Building2 size={20} />} color="navy" trend={`${stats.activeHospitals} active · ${stats.suspendedHospitals} suspended`} />
        <KPICard label="Pending Approvals" value={stats.pendingApprovals} icon={<UserCheck size={20} />} color="warning" trend="Paramedic registrations" />
        <KPICard label="Total Ambulances" value={stats.totalAmbulances} icon={<Ambulance size={20} />} color="accent" trend={`${stats.availableAmbulances} available`} />
        <KPICard label="Active Emergency Cases" value={stats.activeCases} icon={<Siren size={20} />} color="danger" trend="Currently in progress" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hospital Availability Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hospital Availability Overview</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {hospitals.filter((h) => h.partner_status === 'active').slice(0, 6).map((h) => {
                const pct = Math.round((h.available_beds / h.max_bed_capacity) * 100);
                return (
                  <div key={h.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/admin/hospitals/${h.id}`} className="text-sm font-medium text-navy-800 hover:text-accent truncate">
                          {h.name}
                        </Link>
                        <span className="text-xs text-navy-400 shrink-0 ml-2">Level {h.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-navy-50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 30 ? 'bg-green-400' : pct > 10 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-navy-500 font-medium shrink-0">
                          {h.available_beds}/{h.max_bed_capacity} beds
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            <Link to="/admin/hospitals/new" className="flex items-center gap-3 p-3 rounded-lg border border-navy-50 hover:bg-navy-50/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                <Plus size={18} className="text-navy-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">Add Health Partner</p>
                <p className="text-xs text-navy-400">Register a new hospital</p>
              </div>
            </Link>
            <Link to="/admin/approvals" className="flex items-center gap-3 p-3 rounded-lg border border-navy-50 hover:bg-navy-50/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <UserCheck size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">Review Paramedic Approvals</p>
                <p className="text-xs text-navy-400">{stats.pendingApprovals} pending</p>
              </div>
            </Link>
            <Link to="/admin/hospitals" className="flex items-center gap-3 p-3 rounded-lg border border-navy-50 hover:bg-navy-50/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Eye size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">View Health Partners</p>
                <p className="text-xs text-navy-400">Manage all hospitals</p>
              </div>
            </Link>
            <Link to="/admin/activity" className="flex items-center gap-3 p-3 rounded-lg border border-navy-50 hover:bg-navy-50/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Activity size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">View System Activity</p>
                <p className="text-xs text-navy-400">Audit logs and events</p>
              </div>
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Paramedic Approvals</CardTitle>
              <Link to="/admin/approvals" className="text-xs text-accent hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {pendingParamedics.length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-8">No pending approvals.</p>
            ) : (
              <div className="divide-y divide-navy-50/50">
                {pendingParamedics.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy-800">{p.full_name}</p>
                      <p className="text-xs text-navy-400">{p.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-navy-400">{new Date(p.registration_date).toLocaleDateString()}</span>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent System Activity</CardTitle>
              <Link to="/admin/activity" className="text-xs text-accent hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-navy-50/50">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.status === 'success' ? 'bg-green-50' :
                    a.status === 'warning' ? 'bg-amber-50' :
                    a.status === 'error' ? 'bg-red-50' : 'bg-navy-50'
                  }`}>
                    {a.status === 'success' ? <TrendingUp size={14} className="text-green-600" /> :
                     a.status === 'warning' ? <ShieldAlert size={14} className="text-amber-600" /> :
                     a.status === 'error' ? <ShieldAlert size={14} className="text-red-600" /> :
                     <Clock size={14} className="text-navy-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800">{a.action}</p>
                    <p className="text-xs text-navy-400 truncate">{a.description}</p>
                    <p className="text-[10px] text-navy-300 mt-0.5">{a.user} · {new Date(a.timestamp).toLocaleString()}</p>
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
