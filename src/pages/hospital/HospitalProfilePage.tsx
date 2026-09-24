import { useMemo } from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';

export function HospitalProfilePage() {
  const { user } = useAuth();
  const hospital = useMemo(
    () => mockService.getHospitals().find((h) => h.id === user?.hospital_id),
    [user]
  );

  if (!hospital) {
    return (
      <div>
        <PageHeader title="Hospital Profile" />
        <Card><CardBody><p className="text-sm text-navy-400 text-center py-8">No hospital assigned.</p></CardBody></Card>
      </div>
    );
  }

  const admin = mockService.getUserByHospitalId(hospital.id);

  return (
    <div>
      <PageHeader
        title="Hospital Profile"
        description="Hospital information as configured by the Super Admin."
        breadcrumbs={[{ label: 'Health Partner' }, { label: 'Hospital Profile' }]}
        actions={<StatusBadge status={hospital.partner_status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Hospital Information</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-navy-400">Hospital Name</span><span className="text-sm font-medium text-navy-800">{hospital.name}</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Hospital Level</span><Badge variant="info">Level {hospital.level}</Badge></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Location</span><span className="text-sm font-medium text-navy-800">{hospital.location}</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Latitude</span><span className="text-sm font-mono text-navy-800">{hospital.latitude.toFixed(4)}°</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Longitude</span><span className="text-sm font-mono text-navy-800">{hospital.longitude.toFixed(4)}°</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Max Bed Capacity</span><span className="text-sm font-medium text-navy-800">{hospital.max_bed_capacity}</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Available Beds</span><span className="text-sm font-medium text-navy-800">{hospital.available_beds}</span></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Partner Status</span><StatusBadge status={hospital.partner_status} /></div>
            <div className="flex justify-between"><span className="text-sm text-navy-400">Registration Date</span><span className="text-sm text-navy-800">{new Date(hospital.registration_date).toLocaleDateString()}</span></div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Location Preview</CardTitle></CardHeader>
            <CardBody>
              <MapPlaceholder
                latitude={hospital.latitude}
                longitude={hospital.longitude}
                markers={[{ lat: hospital.latitude, lon: hospital.longitude, label: hospital.name, type: 'hospital' }]}
                height="h-56"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Administrator</CardTitle></CardHeader>
            <CardBody>
              {admin ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: admin.avatar_color }}>
                    {admin.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{admin.full_name}</p>
                    <p className="text-xs text-navy-400">{admin.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-navy-400">No administrator assigned.</p>
              )}
            </CardBody>
          </Card>

          <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 flex items-start gap-2">
            <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-navy-500">
              Hospital level, coordinates, and maximum capacity are read-only. Contact the Super Admin to modify these fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
