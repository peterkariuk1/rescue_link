import { useMemo } from 'react';
import { BedDouble, Stethoscope, Ambulance, Siren, Activity, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/Feedback';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';

export function HospitalDashboard() {
  const { user } = useAuth();
  const hospital = useMemo(
    () => mockService.getHospitals().find((h) => h.id === user?.hospital_id),
    [user]
  );

  if (!hospital) {
    return (
      <div>
        <PageHeader title="Hospital Dashboard" />
        <Card><CardBody><p className="text-sm text-navy-400 text-center py-8">No hospital assigned to your account.</p></CardBody></Card>
      </div>
    );
  }

  const occupied = hospital.max_bed_capacity - hospital.available_beds;
  const utilization = Math.round((occupied / hospital.max_bed_capacity) * 100);
  const activeServices = hospital.services.filter((s) => s.status === 'available').length;
  const suspendedServices = hospital.services.filter((s) => s.status === 'suspended').length;
  const totalAmbulances = hospital.ambulances.length;
  const availableAmbulances = hospital.ambulances.filter((a) => a.status === 'available').length;
  const activeAssignments = mockService.getEmergencyCases().filter((c) => c.assigned_hospital_id === hospital.id && !['completed', 'cancelled'].includes(c.status)).length;

  return (
    <div>
      <PageHeader
        title="Hospital Dashboard"
        description={`${hospital.name} · Level ${hospital.level} · ${hospital.location}`}
        breadcrumbs={[{ label: 'Health Partner' }, { label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Max Bed Capacity" value={hospital.max_bed_capacity} icon={<BedDouble size={20} />} color="navy" />
        <KPICard label="Available Beds" value={hospital.available_beds} icon={<BedDouble size={20} />} color="success" trend={`${utilization}% occupied`} />
        <KPICard label="Active Services" value={activeServices} icon={<Stethoscope size={20} />} color="accent" trend={`${suspendedServices} suspended`} />
        <KPICard label="Available Ambulances" value={availableAmbulances} icon={<Ambulance size={20} />} color="warning" trend={`${totalAmbulances} total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Bed Availability Overview</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-navy-950">{hospital.available_beds}<span className="text-base text-navy-400 font-normal"> / {hospital.max_bed_capacity}</span></p>
                <p className="text-sm text-navy-400">Available beds</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-navy-950">{utilization}%</p>
                <p className="text-sm text-navy-400">Utilization</p>
              </div>
            </div>
            <div className="h-3 bg-navy-50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${utilization > 80 ? 'bg-red-400' : utilization > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${utilization}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-navy-400">
              <span>{occupied} occupied</span>
              <span>{hospital.available_beds} available</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Service Availability</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-navy-50/50">
              {hospital.services.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-navy-800">{s.name}</p>
                    <p className="text-xs text-navy-400">Updated {new Date(s.last_updated).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ambulance Status</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-navy-50/50">
              {hospital.ambulances.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                      <Ambulance size={18} className="text-navy-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-800">{a.identifier}</p>
                      <p className="text-xs text-navy-400">{a.plate_number}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              {hospital.ambulances.length === 0 && <p className="p-4 text-sm text-navy-400 text-center">No ambulances registered.</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Emergency Assignments</CardTitle>
              <Badge variant="info">{activeAssignments}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {activeAssignments === 0 ? (
              <p className="text-sm text-navy-400 text-center py-6">No active emergency assignments.</p>
            ) : (
              <div className="space-y-3">
                {mockService.getEmergencyCases().filter((c) => c.assigned_hospital_id === hospital.id && !['completed', 'cancelled'].includes(c.status)).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-navy-50/30">
                    <Siren size={18} className="text-triage-red" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy-800">{c.case_reference}</p>
                      <p className="text-xs text-navy-400">{c.emergency_description}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
