import { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';
import type { Hospital } from '@/types';

export function HospitalComparisonPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const hospitalIds = searchParams.get('hospitals')?.split(',') || [];
  const emergencyCase = caseId ? mockService.getEmergencyCaseById(caseId) : undefined;

  const hospitals = useMemo(
    () => hospitalIds.map((id) => mockService.getHospitalById(id)).filter(Boolean) as Hospital[],
    [hospitalIds]
  );

  if (!emergencyCase || hospitals.length === 0) {
    return <div><PageHeader title="Comparison" /><Card><CardBody><p className="text-sm text-navy-400 text-center py-8">Unable to load comparison. Please select hospitals to compare.</p></CardBody></Card></div>;
  }

  const triage = triageCategories.find((t) => t.id === emergencyCase.triage_category);

  const handleSelect = (hospitalId: string) => {
    mockService.updateEmergencyCase(emergencyCase.id, {
      status: 'awaiting_confirmation',
      assigned_hospital_id: hospitalId,
    });
    mockService.addTimelineEvent(emergencyCase.id, 'Hospital Matching', `Selected hospital for confirmation.`);
    toast('success', 'Hospital selected. Please confirm your selection.');
    navigate(`/dispatch/confirm/${emergencyCase.id}`);
  };

  const rows = [
    { label: 'Hospital Level', render: (h: Hospital) => <Badge variant="info">Level {h.level}</Badge> },
    { label: 'Location', render: (h: Hospital) => <span className="text-sm text-navy-700">{h.location}</span> },
    { label: 'Distance', render: (h: Hospital) => {
      const dist = mockService.matchHospitals(emergencyCase.patient_latitude, emergencyCase.patient_longitude, triage?.id as never, []).find((m) => m.hospital.id === h.id);
      return <span className="text-sm font-medium text-navy-700">{dist?.distance_km} km</span>;
    }},
    { label: 'Est. Travel Time', render: (h: Hospital) => {
      const dist = mockService.matchHospitals(emergencyCase.patient_latitude, emergencyCase.patient_longitude, triage?.id as never, []).find((m) => m.hospital.id === h.id);
      return <span className="text-sm text-navy-700">{dist?.estimated_travel_time}</span>;
    }},
    { label: 'Required Services', render: (h: Hospital) => (
      <div className="flex flex-wrap gap-1">
        {h.services.map((s) => <Badge key={s.id} variant={s.status === 'available' ? 'success' : 'danger'}>{s.name}</Badge>)}
      </div>
    )},
    { label: 'Bed Availability', render: (h: Hospital) => <span className="text-sm font-medium text-navy-700">{h.available_beds} / {h.max_bed_capacity}</span> },
    { label: 'Ambulances', render: (h: Hospital) => <span className="text-sm text-navy-700">{h.ambulances.filter((a) => a.status === 'available').length} available</span> },
    { label: 'Facility Status', render: (h: Hospital) => <StatusBadge status={h.partner_status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Hospital Comparison"
        description={`Compare ${hospitals.length} hospitals for case ${emergencyCase.case_reference}`}
        breadcrumbs={[
          { label: 'Paramedic Dispatch' },
          { label: 'Matching', href: `/dispatch/matching/${emergencyCase.id}` },
          { label: 'Comparison' },
        ]}
        actions={<Link to={`/dispatch/matching/${emergencyCase.id}`} className="btn-secondary"><ArrowLeft size={16} /> Back to Results</Link>}
      />

      <div className="overflow-x-auto">
        <Card>
          <CardBody className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-50">
                  <th className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3 w-40">Criteria</th>
                  {hospitals.map((h) => (
                    <th key={h.id} className="text-left text-xs font-semibold text-navy-400 uppercase px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        {h.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
  {rows.map((row, i) => (
    <tr key={i} className="border-b border-navy-50/50">
      <td className="px-4 py-3 text-sm font-medium text-navy-600">
        {row.label}
      </td>

      {hospitals.map((h) => (
        <td key={h.id} className="px-4 py-3">
          {row.render(h)}
        </td>
      ))}
    </tr>
  ))}

  <tr>
    <td className="px-4 py-3"></td>

    {hospitals.map((h) => (
      <td key={h.id} className="px-4 py-3">
        <Button
          size="sm"
          onClick={() => handleSelect(h.id)}
        >
          <Check size={14} /> Select
        </Button>
      </td>
    ))}
  </tr>
</tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
