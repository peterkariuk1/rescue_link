import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockService } from '@/services/mockService';

export function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const logs = useMemo(() => {
    let list = mockService.getActivityLogs();
    if (search) list = list.filter((l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((l) => l.status === statusFilter);
    if (roleFilter) list = list.filter((l) => l.role === roleFilter);
    return list;
  }, [search, statusFilter, roleFilter]);

  const roleLabels: Record<string, string> = { super_admin: 'Super Admin', health_partner: 'Health Partner', paramedic: 'Paramedic' };

  return (
    <div>
      <PageHeader
        title="System Activity Logs"
        description="Platform-wide audit trail of all user actions and system events."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Activity Logs' }]}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search activity..." />
          </div>
          <select className="input sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="health_partner">Health Partner</option>
            <option value="paramedic">Paramedic</option>
          </select>
          <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Timestamp</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{l.user}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{roleLabels[l.role]}</td>
                  <td className="px-4 py-3 text-sm font-medium text-navy-700">{l.action}</td>
                  <td className="px-4 py-3 text-sm text-navy-500">{l.description}</td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'success' ? 'success' : l.status === 'warning' ? 'warning' : l.status === 'error' ? 'danger' : 'info'}>
                      {l.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-navy-400">No activity found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

