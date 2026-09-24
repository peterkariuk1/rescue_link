import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Building2, Ambulance, Clock, Activity, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { triageCategories, caseStatusLabels } from '@/data/mockData';
import type { CaseStatus } from '@/types';

type Tab = 'overview' | 'patient' | 'vitals' | 'location' | 'hospital' | 'ambulance' | 'timeline' | 'activity';

export function DispatchDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [refresh, setRefresh] = useState(0);

  const emergencyCase = caseId ? mockService.getEmergencyCaseById(caseId) : undefined;

  const statusOptions = useMemo(() => {
    if (!emergencyCase) return [];
    return mockService.getCaseStatusOptions(emergencyCase.status);
  }, [emergencyCase, refresh]);

  if (!emergencyCase) {
    return <div><PageHeader title="Case Not Found" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">Emergency case not found.</p></CardBody></Card></div>;
  }

  const triage = triageCategories.find((t) => t.id === emergencyCase.triage_category);
  const hospital = emergencyCase.assigned_hospital_id ? mockService.getHospitalById(emergencyCase.assigned_hospital_id) : null;
  const ambulance = hospital?.ambulances.find((a) => a.id === emergencyCase.assigned_ambulance_id);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'patient', label: 'Patient Info' },
    { id: 'vitals', label: 'Vitals' },
    { id: 'location', label: 'Location' },
    { id: 'hospital', label: 'Hospital' },
    { id: 'ambulance', label: 'Ambulance' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'activity', label: 'Activity Log' },
  ];

  const handleStatusUpdate = (status: CaseStatus) => {
    mockService.updateEmergencyCase(emergencyCase.id, { status });
    mockService.addTimelineEvent(emergencyCase.id, caseStatusLabels[status], `Status updated to ${caseStatusLabels[status]}.`);
    mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'paramedic', action: 'Case Status Updated', description: `Updated case ${emergencyCase.case_reference} to ${caseStatusLabels[status]}.`, status: 'info' });
    toast('success', `Case status updated to ${caseStatusLabels[status]}.`);
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title={emergencyCase.case_reference}
        description={emergencyCase.emergency_description}
        breadcrumbs={[
          { label: 'Paramedic Dispatch' },
          { label: 'Emergency Cases', href: '/dispatch/cases' },
          { label: emergencyCase.case_reference },
        ]}
        actions={
          <>
            <Link to="/dispatch/cases" className="btn-secondary"><ArrowLeft size={16} /> Back</Link>
            {statusOptions.length > 0 && (
              <div className="flex items-center gap-2">
                {statusOptions.map((opt) => (
                  <Button key={opt.value} size="sm" variant={opt.value === 'cancelled' ? 'danger' : 'primary'} onClick={() => handleStatusUpdate(opt.value)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        }
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Badge variant={triage?.color === 'triage-red' ? 'triage-red' : triage?.color === 'triage-orange' ? 'triage-orange' : triage?.color === 'triage-yellow' ? 'triage-yellow' : 'info'}>{triage?.label}</Badge>
        <StatusBadge status={emergencyCase.status} />
        <span className="text-sm text-navy-400">Created: {new Date(emergencyCase.created_time).toLocaleString()}</span>
      </div>

      <div className="flex gap-1 mb-6 border-b border-navy-50 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-accent text-accent' : 'border-transparent text-navy-400 hover:text-navy-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardBody><div className="flex items-center gap-2 text-navy-400 mb-1"><Stethoscope size={14} /><span className="text-xs">Triage</span></div><p className="text-sm font-semibold text-navy-950">{triage?.label}</p></CardBody></Card>
          <Card><CardBody><div className="flex items-center gap-2 text-navy-400 mb-1"><Building2 size={14} /><span className="text-xs">Hospital</span></div><p className="text-sm font-semibold text-navy-950">{hospital?.name || 'Not assigned'}</p></CardBody></Card>
          <Card><CardBody><div className="flex items-center gap-2 text-navy-400 mb-1"><Ambulance size={14} /><span className="text-xs">Ambulance</span></div><p className="text-sm font-semibold text-navy-950">{ambulance?.identifier || 'Not assigned'}</p></CardBody></Card>
          <Card><CardBody><div className="flex items-center gap-2 text-navy-400 mb-1"><Clock size={14} /><span className="text-xs">Dispatcher</span></div><p className="text-sm font-semibold text-navy-950">{emergencyCase.dispatcher_name}</p></CardBody></Card>
        </div>
      )}

      {tab === 'patient' && (
        <Card><CardBody className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-navy-400">Caller Name</span><span className="text-navy-700">{emergencyCase.caller_name || 'Unknown'}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Caller Phone</span><span className="text-navy-700">{emergencyCase.caller_phone || 'Unknown'}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Emergency Description</span><span className="text-navy-700">{emergencyCase.emergency_description}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Number of Patients</span><span className="text-navy-700">{emergencyCase.number_of_patients}</span></div>
          {emergencyCase.additional_notes && <div className="flex justify-between"><span className="text-navy-400">Additional Notes</span><span className="text-navy-700">{emergencyCase.additional_notes}</span></div>}
        </CardBody></Card>
      )}

      {tab === 'vitals' && emergencyCase.vitals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card><CardBody><p className="text-xs text-navy-400">Temperature</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.temperature ? `${emergencyCase.vitals.temperature}${emergencyCase.vitals.temperature_unit}` : 'N/A'}</p></CardBody></Card>
          <Card><CardBody><p className="text-xs text-navy-400">Heart Rate</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.heart_rate ? `${emergencyCase.vitals.heart_rate} bpm` : 'N/A'}</p></CardBody></Card>
          <Card><CardBody><p className="text-xs text-navy-400">Respiratory Rate</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.respiratory_rate ? `${emergencyCase.vitals.respiratory_rate}/min` : 'N/A'}</p></CardBody></Card>
          <Card><CardBody><p className="text-xs text-navy-400">Blood Pressure</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.blood_pressure_systolic ? `${emergencyCase.vitals.blood_pressure_systolic}/${emergencyCase.vitals.blood_pressure_diastolic} mmHg` : 'N/A'}</p></CardBody></Card>
          <Card><CardBody><p className="text-xs text-navy-400">O2 Saturation</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.oxygen_saturation ? `${emergencyCase.vitals.oxygen_saturation}%` : 'N/A'}</p></CardBody></Card>
          <Card><CardBody><p className="text-xs text-navy-400">Glasgow Coma Scale</p><p className="text-lg font-semibold text-navy-950">{emergencyCase.vitals.glasgow_coma_scale || 'N/A'}</p></CardBody></Card>
          {emergencyCase.vitals.additional_observations && <Card className="sm:col-span-2 lg:col-span-3"><CardBody><p className="text-xs text-navy-400 mb-1">Additional Observations</p><p className="text-sm text-navy-700">{emergencyCase.vitals.additional_observations}</p></CardBody></Card>}
        </div>
      )}

      {tab === 'location' && (
        <Card>
          <CardBody className="space-y-4">
            <MapPlaceholder
              latitude={emergencyCase.patient_latitude}
              longitude={emergencyCase.patient_longitude}
              markers={[{ lat: emergencyCase.patient_latitude, lon: emergencyCase.patient_longitude, label: 'Patient', type: 'patient' as const }]}
              height="h-64"
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-navy-400">Coordinates</p><p className="font-mono text-navy-700">{emergencyCase.patient_latitude.toFixed(4)}, {emergencyCase.patient_longitude.toFixed(4)}</p></div>
              <div><p className="text-xs text-navy-400">Accuracy</p><p className="text-navy-700 capitalize">{emergencyCase.location_accuracy}</p></div>
              {emergencyCase.location_address && <div><p className="text-xs text-navy-400">Address</p><p className="text-navy-700">{emergencyCase.location_address}</p></div>}
              {emergencyCase.location_notes && <div><p className="text-xs text-navy-400">Notes</p><p className="text-navy-700">{emergencyCase.location_notes}</p></div>}
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'hospital' && hospital && (
        <Card><CardBody className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-navy-400">Name</span><span className="font-medium text-navy-800">{hospital.name}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Level</span><span className="text-navy-700">Level {hospital.level}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Location</span><span className="text-navy-700">{hospital.location}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Available Beds</span><span className="text-green-600 font-medium">{hospital.available_beds}</span></div>
          <div><p className="text-navy-400 mb-1">Services</p><div className="flex flex-wrap gap-1.5">{hospital.services.map((s) => <Badge key={s.id} variant={s.status === 'available' ? 'success' : 'danger'}>{s.name}</Badge>)}</div></div>
        </CardBody></Card>
      )}

      {tab === 'ambulance' && ambulance && (
        <Card><CardBody className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-navy-400">Identifier</span><span className="font-medium text-navy-800">{ambulance.identifier}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Plate Number</span><span className="text-navy-700">{ambulance.plate_number}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Type</span><span className="text-navy-700">{ambulance.type}</span></div>
          <div className="flex justify-between"><span className="text-navy-400">Status</span><StatusBadge status={ambulance.status} /></div>
        </CardBody></Card>
      )}

      {tab === 'timeline' && (
        <Card><CardBody>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-navy-50" />
            <div className="space-y-4">
              {emergencyCase.timeline.map((event, i) => (
                <div key={event.id} className="relative flex items-start gap-4 pl-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i === emergencyCase.timeline.length - 1 ? 'bg-accent' : 'bg-navy-100'}`}>
                    <div className={`w-3 h-3 rounded-full ${i === emergencyCase.timeline.length - 1 ? 'bg-white' : 'bg-navy-300'}`} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-navy-800">{event.event}</p>
                    {event.description && <p className="text-xs text-navy-400 mt-0.5">{event.description}</p>}
                    <p className="text-xs text-navy-300 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody></Card>
      )}

      {tab === 'activity' && (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-navy-50/50">
            {mockService.getActivityLogs().filter((a) => a.description.includes(emergencyCase.case_reference) || a.description.includes(emergencyCase.case_reference.split('-').slice(-1)[0])).slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0"><Activity size={14} className="text-navy-500" /></div>
                <div><p className="text-sm font-medium text-navy-800">{a.action}</p><p className="text-xs text-navy-400">{a.description}</p><p className="text-[10px] text-navy-300 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p></div>
              </div>
            ))}
            {mockService.getActivityLogs().filter((a) => a.description.includes(emergencyCase.case_reference)).length === 0 && <p className="p-4 text-sm text-navy-400 text-center">No activity logged.</p>}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
