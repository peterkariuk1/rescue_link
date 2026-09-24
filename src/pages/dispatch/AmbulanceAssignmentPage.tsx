import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ambulance as AmbulanceIcon, Check, X, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { ambulanceStatusLabels } from '@/data/mockData';
import type { Ambulance } from '@/types';
export function AmbulanceAssignmentPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmAssign, setConfirmAssign] = useState<Ambulance | null>(null);
  const [refresh, setRefresh] = useState(0);

  const emergencyCase = caseId ? mockService.getEmergencyCaseById(caseId) : undefined;
  const hospital = emergencyCase?.assigned_hospital_id ? mockService.getHospitalById(emergencyCase.assigned_hospital_id) : undefined;

  if (!emergencyCase || !hospital) {
    return <div><PageHeader title="Ambulance Assignment" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">No hospital confirmed for this case.</p></CardBody></Card></div>;
  }

  const availableAmbulances = hospital.ambulances.filter((a) => a.status === 'available');
  const currentAmbulance = emergencyCase.assigned_ambulance_id ? hospital.ambulances.find((a) => a.id === emergencyCase.assigned_ambulance_id) : null;

  const handleAssign = (amb: Ambulance) => {
    mockService.updateEmergencyCase(emergencyCase.id, { status: 'ambulance_assigned', assigned_ambulance_id: amb.id });
    mockService.updateAmbulance(hospital.id, amb.id, { status: 'dispatched' });
    mockService.addTimelineEvent(emergencyCase.id, 'Ambulance Assigned', `${amb.identifier} assigned to case.`);
    mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'paramedic', action: 'Ambulance Assigned', description: `Assigned ${amb.identifier} to case ${emergencyCase.case_reference}.`, status: 'success' });
    toast('success', `${amb.identifier} assigned successfully.`);
    setRefresh((r) => r + 1);
    setConfirmAssign(null);
  };

  const handleReassign = () => {
    if (currentAmbulance) {
      mockService.updateAmbulance(hospital.id, currentAmbulance.id, { status: 'available' });
      mockService.updateEmergencyCase(emergencyCase.id, { assigned_ambulance_id: undefined, status: 'hospital_confirmed' });
      toast('success', 'Ambulance unassigned. Select a new ambulance.');
      setRefresh((r) => r + 1);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ambulance Assignment"
        description={`Case ${emergencyCase.case_reference} · ${hospital.name}`}
        breadcrumbs={[
          { label: 'Paramedic Dispatch' },
          { label: 'Confirm', href: `/dispatch/confirm/${emergencyCase.id}` },
          { label: 'Ambulance' },
        ]}
        actions={<Link to={`/dispatch/confirm/${emergencyCase.id}`} className="btn-secondary"><ArrowLeft size={16} /> Back</Link>}
      />

      {currentAmbulance ? (
        <Card className="mb-6">
          <CardHeader><CardTitle>Currently Assigned Ambulance</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><AmbulanceIcon size={20} className="text-green-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-navy-950">{currentAmbulance.identifier}</p>
                  <p className="text-xs text-navy-400">{currentAmbulance.plate_number} · {currentAmbulance.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={currentAmbulance.status} />
                <Button variant="danger" size="sm" onClick={handleReassign}><X size={14} /> Reassign</Button>
                <Button size="sm" onClick={() => navigate(`/dispatch/active`)}><Check size={14} /> Go to Active Dispatches</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="mb-4 p-4 rounded-lg bg-navy-50/30 text-sm text-navy-500">
          <AlertCircle size={14} className="inline mr-1.5" />
          Select an available ambulance to assign to this case. Ambulances marked as dispatched, on mission, maintenance, or unavailable cannot be assigned.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Available Ambulances at {hospital.name}</CardTitle></CardHeader>
        <CardBody className="p-0">
          {availableAmbulances.length === 0 ? (
            <p className="text-sm text-navy-400 text-center py-8">No available ambulances at this hospital. Please contact the hospital directly.</p>
          ) : (
            <div className="divide-y divide-navy-50/50">
              {availableAmbulances.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-navy-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center"><AmbulanceIcon size={20} className="text-navy-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-navy-800">{a.identifier}</p>
                      <p className="text-xs text-navy-400">{a.plate_number} · {a.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Available</Badge>
                    <Button size="sm" onClick={() => setConfirmAssign(a)} disabled={!!currentAmbulance}><Check size={14} /> Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hospital.ambulances.filter((a) => a.status !== 'available').length > 0 && (
            <div className="p-4 border-t border-navy-50">
              <p className="text-xs text-navy-400 mb-2">Unavailable Ambulances:</p>
              <div className="flex flex-wrap gap-2">
                {hospital.ambulances.filter((a) => a.status !== 'available').map((a) => (
                  <span key={a.id} className="text-xs text-navy-400 flex items-center gap-1">
                    <X size={12} className="text-red-400" />
                    {a.identifier} ({ambulanceStatusLabels[a.status]})
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!confirmAssign}
        onClose={() => setConfirmAssign(null)}
        onConfirm={() => confirmAssign && handleAssign(confirmAssign)}
        title="Assign Ambulance"
        message={`Assign ${confirmAssign?.identifier} to case ${emergencyCase.case_reference}?`}
        confirmLabel="Assign"
        variant="primary"
      />
    </div>
  );
}
