import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { ambulanceStatusLabels } from '@/data/mockData';
import type { Ambulance, AmbulanceStatus } from '@/types';

export function AmbulancesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingAmb, setEditingAmb] = useState<Ambulance | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Ambulance | null>(null);
  const [form, setForm] = useState({ plate_number: '', identifier: '', type: 'Type A (Basic Life Support)', status: 'available' as AmbulanceStatus });

  const hospital = useMemo(
    () => mockService.getHospitals().find((h) => h.id === user?.hospital_id),
    [user, refresh]
  );

  if (!hospital) return <div><PageHeader title="Ambulances" /><Card><p className="p-4 text-sm text-navy-400">No hospital assigned.</p></Card></div>;

  const openAdd = () => { setEditingAmb(null); setForm({ plate_number: '', identifier: '', type: 'Type A (Basic Life Support)', status: 'available' }); setShowForm(true); };
  const openEdit = (amb: Ambulance) => { setEditingAmb(amb); setForm({ plate_number: amb.plate_number, identifier: amb.identifier, type: amb.type, status: amb.status }); setShowForm(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate_number.trim() || !form.identifier.trim()) { toast('error', 'Plate number and identifier are required.'); return; }
    if (editingAmb) {
      mockService.updateAmbulance(hospital.id, editingAmb.id, form);
      toast('success', 'Ambulance updated successfully.');
    } else {
      mockService.addAmbulance(hospital.id, form);
      mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'health_partner', action: 'Ambulance Registered', description: `Registered ambulance ${form.identifier} at ${hospital.name}.`, status: 'success' });
      toast('success', 'Ambulance registered successfully.');
    }
    setShowForm(false);
    setRefresh((r) => r + 1);
  };

  const handleDelete = (amb: Ambulance) => {
    mockService.deleteAmbulance(hospital.id, amb.id);
    toast('success', `${amb.identifier} has been deleted.`);
    setRefresh((r) => r + 1);
  };

  const handleStatusChange = (amb: Ambulance, status: AmbulanceStatus) => {
    mockService.updateAmbulance(hospital.id, amb.id, { status });
    toast('success', `${amb.identifier} status updated to ${ambulanceStatusLabels[status]}.`);
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title="Ambulance Management"
        description="Register and manage ambulances for your hospital."
        breadcrumbs={[{ label: 'Health Partner' }, { label: 'Ambulances' }]}
        actions={<Button onClick={openAdd}><Plus size={16} /> Register Ambulance</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Plate Number</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Identifier</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Last Updated</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospital.ambulances.map((a) => (
                <tr key={a.id} className="border-b border-navy-50/50 hover:bg-navy-50/30">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{a.plate_number}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{a.identifier}</td>
                  <td className="px-4 py-3 text-sm text-navy-500">{a.type}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a, e.target.value as AmbulanceStatus)}
                      className="text-xs rounded-lg border border-navy-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    >
                      {Object.entries(ambulanceStatusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(a.last_updated).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => setConfirmDelete(a)} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hospital.ambulances.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-navy-400">No ambulances registered.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingAmb ? 'Edit Ambulance' : 'Register Ambulance'}
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSave}>{editingAmb ? 'Save' : 'Register'}</Button></>}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Plate Number" value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} placeholder="e.g. KDA 001A" />
          <Input label="Ambulance Identifier" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="e.g. AMB-001" />
          <Select label="Ambulance Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Type A (Basic Life Support)</option>
            <option>Type B (Advanced Life Support)</option>
            <option>Type C (Patient Transport)</option>
          </Select>
          <Select label="Availability Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AmbulanceStatus })}>
            {Object.entries(ambulanceStatusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDelete(confirmDelete)} title="Delete Ambulance" message={`Delete ${confirmDelete?.identifier}? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
