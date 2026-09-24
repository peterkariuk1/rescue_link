import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, BedDouble, Ambulance, Check, X, AlertCircle, ArrowLeft, GitCompare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';
import type { HospitalMatch } from '@/types';

export function HospitalMatchingPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const emergencyCase = caseId ? mockService.getEmergencyCaseById(caseId) : undefined;

  const matches = useMemo<HospitalMatch[]>(() => {
    if (!emergencyCase) return [];
    const triage = triageCategories.find((t) => t.id === emergencyCase.triage_category);
    return mockService.matchHospitals(
      emergencyCase.patient_latitude,
      emergencyCase.patient_longitude,
      (triage?.id || 'yellow_amber') as never,
      []
    );
  }, [emergencyCase, refresh]);

  if (!emergencyCase) {
    return <div><PageHeader title="Case Not Found" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">Emergency case not found.</p></CardBody></Card></div>;
  }

  const triage = triageCategories.find((t) => t.id === emergencyCase.triage_category);

  const handleSelectHospital = (match: HospitalMatch) => {
    mockService.updateEmergencyCase(emergencyCase.id, {
      status: 'awaiting_confirmation',
      assigned_hospital_id: match.hospital.id,
    });
    mockService.addTimelineEvent(emergencyCase.id, 'Hospital Matching', `Selected ${match.hospital.name} for confirmation.`);
    toast('success', `${match.hospital.name} selected. Please confirm your selection.`);
    navigate(`/dispatch/confirm/${emergencyCase.id}`);
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) { toast('warning', 'You can compare up to 4 hospitals at once.'); return prev; }
      return [...prev, id];
    });
  };

  return (
    <div>
      <PageHeader
        title="Hospital Matching Results"
        description={`Case ${emergencyCase.case_reference} · ${triage?.label}`}
        breadcrumbs={[
          { label: 'Paramedic Dispatch' },
          { label: 'Emergency Cases', href: '/dispatch/cases' },
          { label: 'Matching' },
        ]}
        actions={
          <>
            <Link to={`/dispatch/cases/${emergencyCase.id}`} className="btn-secondary"><ArrowLeft size={16} /> Back to Case</Link>
            {selectedForCompare.length >= 2 && (
              <Button onClick={() => navigate(`/dispatch/compare/${emergencyCase.id}?hospitals=${selectedForCompare.join(',')}`)}>
                <GitCompare size={16} /> Compare ({selectedForCompare.length})
              </Button>
            )}
          </>
        }
      />

      {/* Matching criteria */}
      <Card className="mb-4">
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-navy-400">Triage Category</p><p className="font-medium text-navy-800">{triage?.label}</p></div>
            <div><p className="text-xs text-navy-400">Patient Location</p><p className="font-medium text-navy-800 font-mono">{emergencyCase.patient_latitude.toFixed(4)}, {emergencyCase.patient_longitude.toFixed(4)}</p></div>
            <div><p className="text-xs text-navy-400">Location Accuracy</p><p className="font-medium text-navy-800 capitalize">{emergencyCase.location_accuracy}</p></div>
            <div><p className="text-xs text-navy-400">Hospitals Found</p><p className="font-medium text-navy-800">{matches.length} ({matches.filter((m) => m.is_suitable).length} suitable)</p></div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-4">
        <MapPlaceholder
          latitude={emergencyCase.patient_latitude}
          longitude={emergencyCase.patient_longitude}
          markers={[
            { lat: emergencyCase.patient_latitude, lon: emergencyCase.patient_longitude, label: 'Patient', type: 'patient' as const },
            ...matches.slice(0, 5).map((m) => ({ lat: m.hospital.latitude, lon: m.hospital.longitude, label: m.hospital.name, type: 'hospital' as const })),
          ]}
          height="h-56"
        />
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.hospital.id} hover>
            <CardBody>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-navy-950">{match.hospital.name}</h3>
                        <Badge variant="info">Level {match.hospital.level}</Badge>
                        {match.is_suitable ? <Badge variant="success">Suitable</Badge> : <Badge variant="danger">Not Suitable</Badge>}
                      </div>
                      <p className="text-sm text-navy-400 mt-0.5">{match.hospital.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-navy-400" />
                      <div><p className="text-xs text-navy-400">Distance</p><p className="font-medium text-navy-700">{match.distance_km} km</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-navy-400" />
                      <div><p className="text-xs text-navy-400">Est. Travel</p><p className="font-medium text-navy-700">{match.estimated_travel_time}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble size={14} className="text-navy-400" />
                      <div><p className="text-xs text-navy-400">Available Beds</p><p className="font-medium text-navy-700">{match.available_beds}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ambulance size={14} className="text-navy-400" />
                      <div><p className="text-xs text-navy-400">Ambulances</p><p className="font-medium text-navy-700">{match.ambulances_available} available</p></div>
                    </div>
                  </div>
                  {match.reasons.length > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-red-50/50 border border-red-100">
                      {match.reasons.map((r, i) => (
                        <p key={i} className="text-xs text-red-600 flex items-center gap-1.5"><X size={12} /> {r}</p>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.hospital.services.map((s) => (
                      <Badge key={s.id} variant={s.status === 'available' ? 'success' : 'danger'}>{s.name}: {s.status === 'available' ? 'Available' : 'Suspended'}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedForCompare.includes(match.hospital.id)} onChange={() => toggleCompare(match.hospital.id)} className="w-4 h-4 rounded border-navy-200 text-accent" />
                    <span className="text-navy-600">Compare</span>
                  </label>
                  <Button
                    onClick={() => handleSelectHospital(match)}
                    disabled={!match.is_suitable}
                    className="flex-1"
                  >
                    <Check size={16} /> Select
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {matches.length === 0 && <Card><CardBody><p className="text-sm text-navy-400 text-center py-8">No hospitals available for matching.</p></CardBody></Card>}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-navy-50/30 text-xs text-navy-500">
        <AlertCircle size={14} className="inline mr-1.5" />
        Matching results are based on mock configurable rules (distance, triage level, bed/service availability). This system supports clinical decision-making and does not replace professional emergency medical judgment.
      </div>
    </div>
  );
}
