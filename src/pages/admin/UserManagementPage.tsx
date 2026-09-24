import { useState, useMemo } from 'react';
import { Search, Eye, Ban, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { mockService } from '@/services/mockService';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: User; action: string } | null>(null);
  const [refresh, setRefresh] = useState(0);

  const users = useMemo(() => {
    let list = mockService.getUsers();
    if (search) list = list.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    if (statusFilter) list = list.filter((u) => u.status === statusFilter);
    return list;
  }, [search, roleFilter, statusFilter, refresh]);

  const handleAction = (user: User, action: string) => {
    if (user.id === currentUser?.id) {
      toast('error', 'You cannot modify your own account.');
      return;
    }
    mockService.updateUserStatus(user.id, action === 'suspend' ? 'suspended' : 'approved');
    toast('success', `${user.full_name} has been ${action === 'suspend' ? 'suspended' : 'resumed'}.`);
    setRefresh((r) => r + 1);
    setSelectedUser(null);
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin', health_partner: 'Health Partner', paramedic: 'Paramedic',
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage all user accounts and access across the platform."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'User Management' }]}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search users..." />
          </div>
          <select className="input sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="health_partner">Health Partner</option>
            <option value="paramedic">Paramedic</option>
          </select>
          <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="approved">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Registered</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Last Login</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{roleLabels[u.role]}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'approved' ? 'success' : u.status === 'pending' ? 'warning' : u.status === 'suspended' ? 'danger' : 'neutral'}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(u.registration_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-navy-400">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedUser(u)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="View"><Eye size={16} /></button>
                      {u.status === 'approved' && u.id !== currentUser?.id && (
                        <button onClick={() => setConfirmAction({ user: u, action: 'suspend' })} className="p-1.5 rounded text-amber-600 hover:bg-amber-50" title="Suspend"><Ban size={16} /></button>
                      )}
                      {u.status === 'suspended' && u.id !== currentUser?.id && (
                        <button onClick={() => setConfirmAction({ user: u, action: 'resume' })} className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Resume"><RotateCcw size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile">
        {selectedUser && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-navy-50">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: selectedUser.avatar_color }}>
                {selectedUser.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-base font-semibold text-navy-950">{selectedUser.full_name}</p>
                <p className="text-sm text-navy-400">{roleLabels[selectedUser.role]}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-navy-400">Email</span><span className="text-sm text-navy-800">{selectedUser.email}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Phone</span><span className="text-sm text-navy-800">{selectedUser.phone}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Status</span><Badge variant={selectedUser.status === 'approved' ? 'success' : 'warning'}>{selectedUser.status}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Registered</span><span className="text-sm text-navy-800">{new Date(selectedUser.registration_date).toLocaleDateString()}</span></div>
              {selectedUser.last_login && <div className="flex justify-between"><span className="text-sm text-navy-400">Last Login</span><span className="text-sm text-navy-800">{new Date(selectedUser.last_login).toLocaleString()}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleAction(confirmAction.user, confirmAction.action)}
        title={confirmAction?.action === 'suspend' ? 'Suspend User' : 'Resume User'}
        message={`Are you sure you want to ${confirmAction?.action} ${confirmAction?.user.full_name}?`}
        confirmLabel={confirmAction?.action === 'suspend' ? 'Suspend' : 'Resume'}
        variant={confirmAction?.action === 'suspend' ? 'danger' : 'primary'}
      />
    </div>
  );
}
