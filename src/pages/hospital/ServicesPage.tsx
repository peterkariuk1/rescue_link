import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Ban, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import type { HospitalService } from '@/types';

export function ServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<HospitalService | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HospitalService | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<HospitalService | null>(null);
  const [confirmResume, setConfirmResume] = useState<HospitalService | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'available' as 'available' | 'suspended' });

  const hospital = useMemo(
    () => mockService.getHospitals().find((h) => h.id === user?.hospital_id),
    [user, refresh]
  );

  if (!hospital) return <div><PageHeader title="Services" /><Card><p className="p-4 text-sm text-navy-400">No hospital assigned.</p></Card></div>;

  const openAdd = () => { setEditingService(null); setForm({ name: '', description: '', status: 'available' }); setShowForm(true); };
  const openEdit = (svc: HospitalService) => { setEditingService(svc); setForm({ name: svc.name, description: svc.description, status: svc.status }); setShowForm(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('error', 'Service name is required.'); return; }
    if (editingService) {
      mockService.updateService(hospital.id, editingService.id, form);
      toast('success', 'Service updated successfully.');
    } else {
      mockService.addService(hospital.id, form);
      mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'health_partner', action: 'Service Added', description: `Added service ${form.name} at ${hospital.name}.`, status: 'success' });
      toast('success', 'Service added successfully.');
    }
    setShowForm(false);
    setRefresh((r) => r + 1);
  };

  const handleDelete = (svc: HospitalService) => {
    mockService.deleteService(hospital.id, svc.id);
    toast('success', `${svc.name} has been deleted.`);
    setRefresh((r) => r + 1);
  };

  const handleSuspend = (svc: HospitalService) => {
    mockService.updateService(hospital.id, svc.id, { status: 'suspended' });
    toast('success', `${svc.name} has been suspended.`);
    setRefresh((r) => r + 1);
  };

  const handleResume = (svc: HospitalService) => {
    mockService.updateService(hospital.id, svc.id, { status: 'available' });
    toast('success', `${svc.name} is now available.`);
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title="Services & Facilities"
        description="Manage the medical services offered by your hospital."
        breadcrumbs={[{ label: 'Health Partner' }, { label: 'Services' }]}
        actions={<Button onClick={openAdd}><Plus size={16} /> Add Service</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Service Name</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Last Updated</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospital.services.map((s) => (
                <tr key={s.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-navy-500 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(s.last_updated).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="Edit"><Pencil size={16} /></button>
                      {s.status === 'available' ? (
                        <button onClick={() => setConfirmSuspend(s)} className="p-1.5 rounded text-amber-600 hover:bg-amber-50" title="Suspend"><Ban size={16} /></button>
                      ) : (
                        <button onClick={() => setConfirmResume(s)} className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Resume"><RotateCcw size={16} /></button>
                      )}
                      <button onClick={() => setConfirmDelete(s)} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hospital.services.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-sm text-navy-400">No services registered.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSave}>{editingService ? 'Save' : 'Add Service'}</Button></>}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Service Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Trauma Care" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the service" />
          <Select label="Availability Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'available' | 'suspended' })}>
            <option value="available">Available</option>
            <option value="suspended">Suspended</option>
          </Select>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDelete(confirmDelete)} title="Delete Service" message={`Delete ${confirmDelete?.name}? This cannot be undone.`} confirmLabel="Delete" />
      <ConfirmDialog open={!!confirmSuspend} onClose={() => setConfirmSuspend(null)} onConfirm={() => confirmSuspend && handleSuspend(confirmSuspend)} title="Suspend Service" message={`Suspend ${confirmSuspend?.name}? It will be unavailable for matching.`} confirmLabel="Suspend" />
      <ConfirmDialog open={!!confirmResume} onClose={() => setConfirmResume(null)} onConfirm={() => confirmResume && handleResume(confirmResume)} title="Resume Service" message={`Resume ${confirmResume?.name}? It will be available for matching.`} confirmLabel="Resume" variant="primary" />
    </div>
  );
}
