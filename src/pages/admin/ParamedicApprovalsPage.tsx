import { useState, useMemo } from 'react';
import { Search, Eye, Check, X, Ban, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { mockService } from '@/services/mockService';
import type { User } from '@/types';

export function ParamedicApprovalsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: User; action: string } | null>(null);
  const [refresh, setRefresh] = useState(0);

  const paramedics = useMemo(() => {
    let list = mockService.getParamedics();
    if (search) list = list.filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [search, statusFilter, refresh]);

  const handleAction = (user: User, action: string) => {
    const statusMap: Record<string, User['status']> = {
      approve: 'approved', reject: 'rejected', suspend: 'suspended', resume: 'approved',
    };
    const actionLabels: Record<string, string> = {
      approve: 'approved', reject: 'rejected', suspend: 'suspended', resume: 'resumed',
    };
    mockService.updateUserStatus(user.id, statusMap[action]);
    mockService.addActivityLog({
      user: 'Amara Okonkwo', role: 'super_admin',
      action: `Paramedic ${actionLabels[action].charAt(0).toUpperCase() + actionLabels[action].slice(1)}`,
      description: `${actionLabels[action].charAt(0).toUpperCase() + actionLabels[action].slice(1)} paramedic ${user.full_name}.`,
      status: action === 'reject' || action === 'suspend' ? 'warning' : 'success',
    });
    toast('success', `${user.full_name} has been ${actionLabels[action]}.`);
    setRefresh((r) => r + 1);
    setSelectedUser(null);
  };

  return (
    <div>
      <PageHeader
        title="Paramedic Approval Management"
        description="Review, approve, reject, and manage paramedic registrations."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Paramedic Approvals' }]}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by name or email..." />
          </div>
          <select className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Full Name</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Registered</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paramedics.map((p) => (
                <tr key={p.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{p.full_name}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{p.email}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{p.phone}</td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(p.registration_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'approved' ? 'success' : p.status === 'pending' ? 'warning' : p.status === 'suspended' ? 'danger' : 'neutral'}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedUser(p)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="View Details"><Eye size={16} /></button>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => setConfirmAction({ user: p, action: 'approve' })} className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Approve"><Check size={16} /></button>
                          <button onClick={() => setConfirmAction({ user: p, action: 'reject' })} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Reject"><X size={16} /></button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => setConfirmAction({ user: p, action: 'suspend' })} className="p-1.5 rounded text-amber-600 hover:bg-amber-50" title="Suspend"><Ban size={16} /></button>
                      )}
                      {p.status === 'suspended' && (
                        <button onClick={() => setConfirmAction({ user: p, action: 'resume' })} className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Resume"><RotateCcw size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paramedics.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-navy-400">No paramedics found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Paramedic Registration Details"
        footer={
          selectedUser && (
            <>
              {selectedUser.status === 'pending' && (
                <>
                  <button className="btn-danger" onClick={() => setConfirmAction({ user: selectedUser, action: 'reject' })}>Reject</button>
                  <button className="btn-primary" onClick={() => setConfirmAction({ user: selectedUser, action: 'approve' })}>Approve</button>
                </>
              )}
              {selectedUser.status === 'approved' && (
                <button className="btn-danger" onClick={() => setConfirmAction({ user: selectedUser, action: 'suspend' })}>Suspend</button>
              )}
              {selectedUser.status === 'suspended' && (
                <button className="btn-primary" onClick={() => setConfirmAction({ user: selectedUser, action: 'resume' })}>Resume</button>
              )}
            </>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-navy-50">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: selectedUser.avatar_color }}>
                {selectedUser.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-base font-semibold text-navy-950">{selectedUser.full_name}</p>
                <Badge variant={selectedUser.status === 'approved' ? 'success' : selectedUser.status === 'pending' ? 'warning' : selectedUser.status === 'suspended' ? 'danger' : 'neutral'}>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-navy-400">Email</span><span className="text-sm text-navy-800">{selectedUser.email}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Phone</span><span className="text-sm text-navy-800">{selectedUser.phone}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Professional Registration</span><span className="text-sm text-navy-800">{selectedUser.professional_registration || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Registration Date</span><span className="text-sm text-navy-800">{new Date(selectedUser.registration_date).toLocaleString()}</span></div>
              {selectedUser.last_login && <div className="flex justify-between"><span className="text-sm text-navy-400">Last Login</span><span className="text-sm text-navy-800">{new Date(selectedUser.last_login).toLocaleString()}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleAction(confirmAction.user, confirmAction.action)}
        title={`${confirmAction?.action.charAt(0).toUpperCase()}${confirmAction?.action.slice(1)} Paramedic`}
        message={`Are you sure you want to ${confirmAction?.action} ${confirmAction?.user.full_name}?`}
        confirmLabel={confirmAction ? confirmAction.action.charAt(0).toUpperCase() + confirmAction.action.slice(1) : 'Confirm'}
        variant={confirmAction?.action === 'approve' || confirmAction?.action === 'resume' ? 'primary' : 'danger'}
      />
    </div>
  );
}
