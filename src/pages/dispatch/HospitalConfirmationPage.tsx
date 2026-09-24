import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, MapPin, Building2, Stethoscope, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';

export function HospitalConfirmationPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);

  const emergencyCase = caseId ? mockService.getEmergencyCaseById(caseId) : undefined;
  const hospital = emergencyCase?.assigned_hospital_id ? mockService.getHospitalById(emergencyCase.assigned_hospital_id) : undefined;

  if (!emergencyCase || !hospital) {
    return <div><PageHeader title="Confirmation" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">No hospital selected. Please go back to matching.</p></CardBody></Card></div>;
  }

  const triage = triageCategories.find((t) => t.id === emergencyCase.triage_category);
  const match = mockService.matchHospitals(emergencyCase.patient_latitude, emergencyCase.patient_longitude, triage?.id as never, []).find((m) => m.hospital.id === hospital.id);

  const handleConfirm = () => {
    mockService.updateEmergencyCase(emergencyCase.id, { status: 'hospital_confirmed' });
    mockService.addTimelineEvent(emergencyCase.id, 'Hospital Confirmed', `${hospital.name} confirmed for case.`);
    mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'paramedic', action: 'Hospital Selected', description: `Selected ${hospital.name} for case ${emergencyCase.case_reference}.`, status: 'success' });
    toast('success', `${hospital.name} confirmed. Proceeding to ambulance assignment.`);
    navigate(`/dispatch/ambulance/${emergencyCase.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Confirm Hospital Selection"
        description={`Case ${emergencyCase.case_reference}`}
        breadcrumbs={[
          { label: 'Paramedic Dispatch' },
          { label: 'Matching', href: `/dispatch/matching/${emergencyCase.id}` },
          { label: 'Confirm' },
        ]}
        actions={
          <>
            <Link to={`/dispatch/compare/${emergencyCase.id}?hospitals=${hospital.id}`} className="btn-secondary">Return to Comparison</Link>
            <Button variant="danger" onClick={() => navigate(`/dispatch/matching/${emergencyCase.id}`)}><X size={16} /> Cancel Selection</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Emergency Case Information</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-navy-400">Case ID</span><span className="font-medium text-navy-800">{emergencyCase.case_reference}</span></div>
              <div className="flex justify-between"><span className="text-navy-400">Triage Category</span><Badge variant={triage?.color === 'triage-red' ? 'triage-red' : triage?.color === 'triage-orange' ? 'triage-orange' : 'info'}>{triage?.label}</Badge></div>
              <div className="flex justify-between"><span className="text-navy-400">Emergency</span><span className="text-navy-700">{emergencyCase.emergency_description}</span></div>
              <div className="flex justify-between"><span className="text-navy-400">Patients</span><span className="text-navy-700">{emergencyCase.number_of_patients}</span></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Patient Location</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><MapPin size={14} className="text-navy-400" /><span className="font-mono text-navy-700">{emergencyCase.patient_latitude.toFixed(4)}, {emergencyCase.patient_longitude.toFixed(4)}</span></div>
              {emergencyCase.location_address && <p className="text-navy-600">{emergencyCase.location_address}</p>}
              <div className="flex justify-between"><span className="text-navy-400">Accuracy</span><span className="text-navy-700 capitalize">{emergencyCase.location_accuracy}</span></div>
            </CardBody>
          </Card>

          {emergencyCase.triage_notes && (
            <Card>
              <CardHeader><CardTitle>Dispatcher Notes</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-navy-600">{emergencyCase.triage_notes}</p></CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Selected Hospital</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center"><Building2 size={20} className="text-navy-600" /></div>
                <div>
                  <p className="text-base font-semibold text-navy-950">{hospital.name}</p>
                  <p className="text-sm text-navy-400">{hospital.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-navy-50/30"><p className="text-xs text-navy-400">Hospital Level</p><p className="font-medium text-navy-800">Level {hospital.level}</p></div>
                <div className="p-3 rounded-lg bg-navy-50/30"><p className="text-xs text-navy-400">Distance</p><p className="font-medium text-navy-800">{match?.distance_km} km</p></div>
                <div className="p-3 rounded-lg bg-navy-50/30"><p className="text-xs text-navy-400">Est. Travel Time</p><p className="font-medium text-navy-800">{match?.estimated_travel_time}</p></div>
                <div className="p-3 rounded-lg bg-navy-50/30"><p className="text-xs text-navy-400">Available Beds</p><p className="font-medium text-green-600">{hospital.available_beds}</p></div>
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-1.5">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.services.map((s) => <Badge key={s.id} variant={s.status === 'available' ? 'success' : 'danger'}>{s.name}: {s.status === 'available' ? 'Available' : 'Suspended'}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-1.5">Ambulances</p>
                <p className="text-sm text-navy-700">{hospital.ambulances.filter((a) => a.status === 'available').length} available of {hospital.ambulances.length} total</p>
              </div>
            </CardBody>
          </Card>

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Confirming will change the case status to "Hospital Confirmed" and proceed to ambulance assignment. Please verify all information before confirming.</p>
          </div>

          <Button className="w-full" size="lg" onClick={() => setConfirm(true)}><Check size={18} /> Confirm Hospital Selection</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleConfirm}
        title="Confirm Hospital"
        message={`Confirm ${hospital.name} for case ${emergencyCase.case_reference}? This will proceed to ambulance assignment.`}
        confirmLabel="Confirm & Continue"
        variant="primary"
      />
    </div>
  );
}
