import { useState, type ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, BedDouble, Stethoscope, Ambulance, Activity, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { mockService } from '@/services/mockService';
import { ambulanceStatusLabels } from '@/data/mockData';

type Tab = 'overview' | 'services' | 'beds' | 'ambulances' | 'activity';

export function HospitalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const hospital = id ? mockService.getHospitalById(id) : undefined;

  if (!hospital) {
    return (
      <div>
        <PageHeader title="Hospital Not Found" breadcrumbs={[{ label: 'Super Admin' }, { label: 'Health Partners', href: '/admin/hospitals' }]} />
        <Card><CardBody><p className="text-sm text-navy-400 text-center py-8">The hospital you are looking for does not exist.</p></CardBody></Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Building2 size={16} /> },
    { id: 'services', label: 'Services', icon: <Stethoscope size={16} /> },
    { id: 'beds', label: 'Bed Availability', icon: <BedDouble size={16} /> },
    { id: 'ambulances', label: 'Ambulances', icon: <Ambulance size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
  ];

  const utilization = Math.round(((hospital.max_bed_capacity - hospital.available_beds) / hospital.max_bed_capacity) * 100);

  return (
    <div>
      <PageHeader
        title={hospital.name}
        description={`Level ${hospital.level} · ${hospital.location}`}
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Health Partners', href: '/admin/hospitals' }, { label: hospital.name }]}
        actions={
          <>
            <Badge variant={hospital.partner_status === 'active' ? 'success' : 'danger'}>
              {hospital.partner_status === 'active' ? 'Active' : 'Suspended'}
            </Badge>
            <button onClick={() => navigate(`/admin/hospitals/${hospital.id}/edit`)} className="btn-secondary">
              <Pencil size={16} /> Edit
            </button>
          </>
        }
      />

      <div className="flex gap-1 mb-6 border-b border-navy-50 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-navy-400 hover:text-navy-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Hospital Information</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-navy-400">Hospital Name</span><span className="text-sm font-medium text-navy-800">{hospital.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Level</span><span className="text-sm font-medium text-navy-800">Level {hospital.level}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Location</span><span className="text-sm font-medium text-navy-800">{hospital.location}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Coordinates</span><span className="text-sm font-mono text-navy-800">{hospital.latitude.toFixed(4)}, {hospital.longitude.toFixed(4)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Max Bed Capacity</span><span className="text-sm font-medium text-navy-800">{hospital.max_bed_capacity}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Available Beds</span><span className="text-sm font-medium text-navy-800">{hospital.available_beds}</span></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Partner Status</span><StatusBadge status={hospital.partner_status} /></div>
              <div className="flex justify-between"><span className="text-sm text-navy-400">Registration Date</span><span className="text-sm text-navy-800">{new Date(hospital.registration_date).toLocaleDateString()}</span></div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Location Preview</CardTitle></CardHeader>
            <CardBody>
              <MapPlaceholder
                latitude={hospital.latitude}
                longitude={hospital.longitude}
                markers={[{ lat: hospital.latitude, lon: hospital.longitude, label: hospital.name, type: 'hospital' }]}
                height="h-72"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'services' && (
        <Card>
          <CardHeader><CardTitle>Services ({hospital.services.length})</CardTitle></CardHeader>
          <CardBody className="p-0">
            <table className="w-full">
              <thead><tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Service</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Last Updated</th>
              </tr></thead>
              <tbody>
                {hospital.services.map((s) => (
                  <tr key={s.id} className="border-b border-navy-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-navy-800">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{s.description}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-sm text-navy-400">{new Date(s.last_updated).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === 'beds' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardBody><p className="text-sm text-navy-400">Maximum Capacity</p><p className="text-3xl font-bold text-navy-950 mt-1">{hospital.max_bed_capacity}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-navy-400">Available Beds</p><p className="text-3xl font-bold text-green-600 mt-1">{hospital.available_beds}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-navy-400">Utilization</p><p className="text-3xl font-bold text-navy-950 mt-1">{utilization}%</p><div className="h-2 bg-navy-50 rounded-full mt-2"><div className="h-full bg-accent rounded-full" style={{ width: `${utilization}%` }} /></div></CardBody></Card>
        </div>
      )}

      {tab === 'ambulances' && (
        <Card>
          <CardHeader><CardTitle>Ambulances ({hospital.ambulances.length})</CardTitle></CardHeader>
          <CardBody className="p-0">
            <table className="w-full">
              <thead><tr className="border-b border-navy-50">
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Plate Number</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Identifier</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {hospital.ambulances.map((a) => (
                  <tr key={a.id} className="border-b border-navy-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-navy-800">{a.plate_number}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{a.identifier}</td>
                    <td className="px-4 py-3 text-sm text-navy-500">{a.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {hospital.ambulances.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-sm text-navy-400">No ambulances registered.</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === 'activity' && (
        <Card>
          <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {mockService.getActivityLogs().filter((a) => a.description.includes(hospital.name)).slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-navy-50/30">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Activity size={14} className="text-navy-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{a.action}</p>
                    <p className="text-xs text-navy-400">{a.description}</p>
                    <p className="text-[10px] text-navy-300 mt-0.5">{a.user} · {new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {mockService.getActivityLogs().filter((a) => a.description.includes(hospital.name)).length === 0 && (
                <p className="text-sm text-navy-400 text-center py-8">No activity recorded.</p>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export function EditHospitalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hospital = id ? mockService.getHospitalById(id) : undefined;
  const [form, setForm] = useState({
    name: hospital?.name || '',
    level: String(hospital?.level || '4'),
    latitude: String(hospital?.latitude || ''),
    longitude: String(hospital?.longitude || ''),
    location: hospital?.location || '',
    max_bed_capacity: String(hospital?.max_bed_capacity || ''),
  });

  if (!hospital) {
    return <div><PageHeader title="Hospital Not Found" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">Hospital not found.</p></CardBody></Card></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockService.updateHospital(hospital.id, {
      name: form.name,
      level: Number(form.level) as typeof hospital.level,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      location: form.location,
      max_bed_capacity: parseInt(form.max_bed_capacity),
    });
    navigate(`/admin/hospitals/${hospital.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Edit Hospital"
        description={hospital.name}
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Health Partners', href: '/admin/hospitals' }, { label: hospital.name, href: `/admin/hospitals/${hospital.id}` }, { label: 'Edit' }]}
      />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Hospital Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Hospital Level</label><select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{[2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>Level {l}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Latitude</label><input type="number" step="any" className="input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
            <div><label className="label">Longitude</label><input type="number" step="any" className="input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
          </div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Maximum Bed Capacity</label><input type="number" className="input" value={form.max_bed_capacity} onChange={(e) => setForm({ ...form, max_bed_capacity: e.target.value })} /></div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/admin/hospitals/${hospital.id}`)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
