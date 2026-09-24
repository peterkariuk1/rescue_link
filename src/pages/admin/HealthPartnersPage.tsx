import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Ban, RotateCcw, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { mockService } from '@/services/mockService';
import type { Hospital, HospitalLevel } from '@/types';

export function HealthPartnersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [confirmDelete, setConfirmDelete] = useState<Hospital | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<Hospital | null>(null);
  const [confirmResume, setConfirmResume] = useState<Hospital | null>(null);
  const [refresh, setRefresh] = useState(0);

  const hospitals = useMemo(() => {
    let list = mockService.getHospitals();
    if (search) list = list.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));
    if (levelFilter) list = list.filter((h) => h.level === Number(levelFilter));
    if (statusFilter) list = list.filter((h) => h.partner_status === statusFilter);
    list.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [search, levelFilter, statusFilter, sortKey, sortDir, refresh]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSuspend = (h: Hospital) => {
    mockService.updateHospitalStatus(h.id, 'suspended');
    mockService.addActivityLog({ user: 'Amara Okonkwo', role: 'super_admin', action: 'Hospital Suspended', description: `Suspended ${h.name}.`, status: 'warning' });
    toast('success', `${h.name} has been suspended.`);
    setRefresh((r) => r + 1);
  };

  const handleResume = (h: Hospital) => {
    mockService.updateHospitalStatus(h.id, 'active');
    mockService.addActivityLog({ user: 'Amara Okonkwo', role: 'super_admin', action: 'Hospital Resumed', description: `Resumed ${h.name}.`, status: 'success' });
    toast('success', `${h.name} has been resumed.`);
    setRefresh((r) => r + 1);
  };

  const handleDelete = (h: Hospital) => {
    mockService.deleteHospital(h.id);
    mockService.addActivityLog({ user: 'Amara Okonkwo', role: 'super_admin', action: 'Hospital Deleted', description: `Deleted ${h.name}.`, status: 'error' });
    toast('success', `${h.name} has been permanently deleted.`);
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title="Health Partners"
        description="Manage registered hospital partners and their operational status."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Health Partners' }]}
        actions={<Link to="/admin/hospitals/new" className="btn-primary"><Plus size={16} /> Add Health Partner</Link>}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by hospital name..."
            />
          </div>
          <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="sm:w-40">
            <option value="">All Levels</option>
            {[2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>Level {l}</option>)}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 cursor-pointer" onClick={() => handleSort('name')}>Hospital Name</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 cursor-pointer" onClick={() => handleSort('level')}>Level</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 cursor-pointer" onClick={() => handleSort('max_bed_capacity')}>Max Beds</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 cursor-pointer" onClick={() => handleSort('available_beds')}>Available</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 cursor-pointer" onClick={() => handleSort('registration_date')}>Registered</th>
                <th className="text-right text-xs font-semibold text-navy-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id} className="border-b border-navy-50/50 hover:bg-navy-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-navy-800">{h.name}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">Level {h.level}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{h.location}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{h.max_bed_capacity}</td>
                  <td className="px-4 py-3 text-sm text-navy-600">{h.available_beds}</td>
                  <td className="px-4 py-3"><StatusBadge status={h.partner_status} /></td>
                  <td className="px-4 py-3 text-sm text-navy-400">{new Date(h.registration_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/admin/hospitals/${h.id}`)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="View"><Eye size={16} /></button>
                      <button onClick={() => navigate(`/admin/hospitals/${h.id}/edit`)} className="p-1.5 rounded text-navy-500 hover:bg-navy-50" title="Edit"><Pencil size={16} /></button>
                      {h.partner_status === 'active' ? (
                        <button onClick={() => setConfirmSuspend(h)} className="p-1.5 rounded text-amber-600 hover:bg-amber-50" title="Suspend"><Ban size={16} /></button>
                      ) : (
                        <button onClick={() => setConfirmResume(h)} className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Resume"><RotateCcw size={16} /></button>
                      )}
                      <button onClick={() => setConfirmDelete(h)} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hospitals.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-navy-400">No health partners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
        onConfirm={() => confirmSuspend && handleSuspend(confirmSuspend)}
        title="Suspend Health Partner"
        message={`Are you sure you want to suspend ${confirmSuspend?.name}? The hospital will lose access to the platform.`}
        confirmLabel="Suspend"
      />
      <ConfirmDialog
        open={!!confirmResume}
        onClose={() => setConfirmResume(null)}
        onConfirm={() => confirmResume && handleResume(confirmResume)}
        title="Resume Health Partner"
        message={`Are you sure you want to resume ${confirmResume?.name}? The hospital will regain platform access.`}
        confirmLabel="Resume"
        variant="primary"
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete Health Partner"
        message={`Are you sure you want to permanently delete ${confirmDelete?.name}? This action cannot be undone and all associated data will be lost.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

export function AddHealthPartnerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    level: '4' as string,
    latitude: '',
    longitude: '',
    location: '',
    max_bed_capacity: '',
    admin_name: '',
    admin_email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Hospital name is required';
    if (!form.level) e.level = 'Hospital level is required';
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Valid latitude (-90 to 90) required';
    if (isNaN(lon) || lon < -180 || lon > 180) e.longitude = 'Valid longitude (-180 to 180) required';
    if (!form.location.trim()) e.location = 'Location is required';
    const cap = parseInt(form.max_bed_capacity);
    if (isNaN(cap) || cap <= 0) e.max_bed_capacity = 'Must be a positive number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const hospital = mockService.addHospital({
      name: form.name,
      level: Number(form.level) as HospitalLevel,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      location: form.location,
      max_bed_capacity: parseInt(form.max_bed_capacity),
    });
    mockService.addActivityLog({
      user: 'Amara Okonkwo', role: 'super_admin', action: 'Hospital Registered',
      description: `Registered ${hospital.name} as health partner.`, status: 'success',
    });
    toast('success', `${hospital.name} has been registered as a health partner.`);
    navigate('/admin/hospitals');
  };

  return (
    <div>
      <PageHeader
        title="Add Health Partner"
        description="Register a new hospital as a health partner on the platform."
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Health Partners', href: '/admin/hospitals' }, { label: 'Add New' }]}
      />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input label="Hospital Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="e.g. Kenyatta National Hospital" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Hospital Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} error={errors.level}>
              <option value="">Select level</option>
              {[2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>Level {l}</option>)}
            </Select>
            <Input label="Maximum Bed Capacity" type="number" value={form.max_bed_capacity} onChange={(e) => setForm({ ...form, max_bed_capacity: e.target.value })} error={errors.max_bed_capacity} placeholder="e.g. 200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} error={errors.latitude} placeholder="-1.3009" hint="Range: -90 to 90" />
            <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} error={errors.longitude} placeholder="36.8077" hint="Range: -180 to 180" />
          </div>
          <Input label="Location (City, Country)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={errors.location} placeholder="e.g. Nairobi, Kenya" />
          <div className="pt-4 border-t border-navy-50">
            <p className="text-sm font-semibold text-navy-800 mb-3">Health Partner Administrator (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Admin Name" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} placeholder="Dr. Jane Doe" />
              <Input label="Admin Email" type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} placeholder="admin@hospital.health" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => navigate('/admin/hospitals')}>Cancel</Button>
            <Button type="submit"><Plus size={16} /> Register Health Partner</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
