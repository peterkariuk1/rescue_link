import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, MapPin, Heart, Phone, AlertCircle, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { triageCategories } from '@/data/mockData';
import type { TriageCategory, PatientVitals, EmergencyCase } from '@/types';

const steps = [
  { id: 1, label: 'Hotline Call', icon: <Phone size={16} /> },
  { id: 2, label: 'Triage', icon: <Stethoscope size={16} /> },
  { id: 3, label: 'Location', icon: <MapPin size={16} /> },
  { id: 4, label: 'Vitals', icon: <Heart size={16} /> },
  { id: 5, label: 'Summary', icon: <Check size={16} /> },
];

export function NewEmergencyCasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const [callInfo, setCallInfo] = useState({
    caller_name: '', caller_phone: '', emergency_description: '', number_of_patients: '1', additional_notes: '', unknown_caller: false,
  });
  const [triage, setTriage] = useState<{ category: TriageCategory | null; notes: string }>({ category: null, notes: '' });
  const [location, setLocation] = useState({ latitude: '', longitude: '', address: '', accuracy: 'medium', notes: '' });
  const [vitals, setVitals] = useState<PatientVitals>({
    temperature: undefined, temperature_unit: '°C', heart_rate: undefined, respiratory_rate: undefined,
    blood_pressure_systolic: undefined, blood_pressure_diastolic: undefined, oxygen_saturation: undefined,
    glasgow_coma_scale: undefined, blood_glucose: undefined, additional_observations: '',
    source: 'On-scene paramedic', time_recorded: new Date().toISOString(), notes: '',
  });

  const canProceed = () => {
    if (step === 1) return callInfo.emergency_description.trim() !== '';
    if (step === 2) return triage.category !== null;
    if (step === 3) return location.latitude !== '' && location.longitude !== '';
    if (step === 4) return true;
    return true;
  };

  const handleSave = () => {
    const triageData = triageCategories.find((t) => t.id === triage.category);
    const newCase: Partial<EmergencyCase> = {
      dispatcher_name: user?.full_name || 'Unknown',
      caller_name: callInfo.unknown_caller ? undefined : callInfo.caller_name,
      caller_phone: callInfo.unknown_caller ? undefined : callInfo.caller_phone,
      emergency_description: callInfo.emergency_description,
      number_of_patients: parseInt(callInfo.number_of_patients) || 1,
      additional_notes: callInfo.additional_notes,
      triage_category: triage.category || 'yellow_amber',
      priority_level: triageData?.priority || 3,
      triage_notes: triage.notes,
      triage_timestamp: new Date().toISOString(),
      patient_latitude: parseFloat(location.latitude) || 0,
      patient_longitude: parseFloat(location.longitude) || 0,
      location_address: location.address,
      location_accuracy: location.accuracy,
      location_notes: location.notes,
      vitals,
      status: 'new',
    };
    const created = mockService.createEmergencyCase(newCase);
    mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'paramedic', action: 'Emergency Case Created', description: `Created emergency case ${created.case_reference}.`, status: 'info' });
    toast('success', `Emergency case ${created.case_reference} created. Proceeding to hospital matching.`);
    navigate(`/dispatch/matching/${created.id}`);
  };

  return (
    <div>
      <PageHeader
        title="New Emergency Case"
        description="Register a new emergency and find a suitable hospital."
        breadcrumbs={[{ label: 'Paramedic Dispatch' }, { label: 'New Emergency Case' }]}
      />

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-navy-950 text-white' : 'bg-navy-50 text-navy-400'
                }`}>
                  {step > s.id ? <Check size={18} /> : s.icon}
                </div>
                <span className={`text-xs font-medium ${step >= s.id ? 'text-navy-800' : 'text-navy-300'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 -mt-5 ${step > s.id ? 'bg-green-500' : 'bg-navy-50'}`} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardBody>
          {/* Step 1: Hotline Call */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2"><Phone size={18} className="text-navy-600" /><h3 className="text-base font-semibold text-navy-950">Hotline Call Information</h3></div>
              <div className="p-3 rounded-lg bg-navy-50/30 text-sm text-navy-500">
                <p><span className="font-medium">Case Reference:</span> Auto-generated on save</p>
                <p><span className="font-medium">Call Time:</span> {new Date().toLocaleString()}</p>
                <p><span className="font-medium">Dispatcher:</span> {user?.full_name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Caller Name (optional)" value={callInfo.caller_name} onChange={(e) => setCallInfo({ ...callInfo, caller_name: e.target.value })} disabled={callInfo.unknown_caller} placeholder="Caller name" />
                <Input label="Caller Phone (optional)" value={callInfo.caller_phone} onChange={(e) => setCallInfo({ ...callInfo, caller_phone: e.target.value })} disabled={callInfo.unknown_caller} placeholder="+254 ..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={callInfo.unknown_caller} onChange={(e) => setCallInfo({ ...callInfo, unknown_caller: e.target.checked })} className="w-4 h-4 rounded border-navy-200 text-accent" />
                <span className="text-sm text-navy-600">Mark caller information as unknown</span>
              </label>
              <Textarea label="Emergency Description" value={callInfo.emergency_description} onChange={(e) => setCallInfo({ ...callInfo, emergency_description: e.target.value })} placeholder="Describe the emergency situation..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Number of Patients" value={callInfo.number_of_patients} onChange={(e) => setCallInfo({ ...callInfo, number_of_patients: e.target.value })}>
                  {[1, 2, 3, 4, 5, '5+'].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <Textarea label="Additional Notes (optional)" value={callInfo.additional_notes} onChange={(e) => setCallInfo({ ...callInfo, additional_notes: e.target.value })} placeholder="Any additional information..." />
            </div>
          )}

          {/* Step 2: Triage */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2"><Stethoscope size={18} className="text-navy-600" /><h3 className="text-base font-semibold text-navy-950">Triage Selection</h3></div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">These categories are mock configurable values for demonstration. Final triage definitions must be confirmed by qualified emergency medical professionals.</p>
              </div>
              <div className="space-y-3">
                {triageCategories.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTriage({ ...triage, category: t.id })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      triage.category === t.id ? `border-${t.color} bg-${t.bgColor}` : 'border-navy-50 hover:border-navy-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${triage.category === t.id ? `bg-${t.color} border-${t.color}` : 'border-navy-200'}`}>
                        {triage.category === t.id && <Check size={12} className="text-white m-auto" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${t.color}`} />
                          <span className="text-sm font-semibold text-navy-950">{t.label}</span>
                          <span className="text-xs text-navy-400">Priority {t.priority}</span>
                        </div>
                        <p className="text-xs text-navy-500 mt-1">{t.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Textarea label="Dispatcher Notes (optional)" value={triage.notes} onChange={(e) => setTriage({ ...triage, notes: e.target.value })} placeholder="Additional triage observations..." />
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2"><MapPin size={18} className="text-navy-600" /><h3 className="text-base font-semibold text-navy-950">Patient Location</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Latitude" type="number" step="any" value={location.latitude} onChange={(e) => setLocation({ ...location, latitude: e.target.value })} placeholder="-1.3009" hint="Range: -90 to 90" />
                <Input label="Longitude" type="number" step="any" value={location.longitude} onChange={(e) => setLocation({ ...location, longitude: e.target.value })} placeholder="36.8077" hint="Range: -180 to 180" />
              </div>
              <Input label="Location Address (optional)" value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} placeholder="Street, area, landmark" />
              <Select label="Location Accuracy" value={location.accuracy} onChange={(e) => setLocation({ ...location, accuracy: e.target.value })}>
                <option value="high">High (GPS confirmed)</option>
                <option value="medium">Medium (Approximate)</option>
                <option value="low">Low (Estimated)</option>
              </Select>
              <Textarea label="Additional Location Notes (optional)" value={location.notes} onChange={(e) => setLocation({ ...location, notes: e.target.value })} placeholder="Landmarks, directions, access notes..." />
              {location.latitude && location.longitude && (
                <MapPlaceholder
                  latitude={parseFloat(location.latitude)}
                  longitude={parseFloat(location.longitude)}
                  markers={[
                    { lat: parseFloat(location.latitude), lon: parseFloat(location.longitude), label: 'Patient', type: 'patient' as const },
                    ...mockService.getActiveHospitals().slice(0, 3).map((h) => ({ lat: h.latitude, lon: h.longitude, label: h.name, type: 'hospital' as const })),
                  ]}
                  height="h-56"
                />
              )}
            </div>
          )}

          {/* Step 4: Vitals */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2"><Heart size={18} className="text-navy-600" /><h3 className="text-base font-semibold text-navy-950">Patient Vitals</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="Temperature" type="number" step="any" value={vitals.temperature ?? ''} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value ? parseFloat(e.target.value) : undefined })} suffix="°C" />
                <Input label="Heart Rate" type="number" value={vitals.heart_rate ?? ''} onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value ? parseInt(e.target.value) : undefined })} suffix="bpm" />
                <Input label="Respiratory Rate" type="number" value={vitals.respiratory_rate ?? ''} onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value ? parseInt(e.target.value) : undefined })} suffix="/min" />
                <Input label="Blood Pressure (Systolic)" type="number" value={vitals.blood_pressure_systolic ?? ''} onChange={(e) => setVitals({ ...vitals, blood_pressure_systolic: e.target.value ? parseInt(e.target.value) : undefined })} suffix="mmHg" />
                <Input label="Blood Pressure (Diastolic)" type="number" value={vitals.blood_pressure_diastolic ?? ''} onChange={(e) => setVitals({ ...vitals, blood_pressure_diastolic: e.target.value ? parseInt(e.target.value) : undefined })} suffix="mmHg" />
                <Input label="Oxygen Saturation" type="number" value={vitals.oxygen_saturation ?? ''} onChange={(e) => setVitals({ ...vitals, oxygen_saturation: e.target.value ? parseInt(e.target.value) : undefined })} suffix="%" />
                <Input label="Glasgow Coma Scale" type="number" value={vitals.glasgow_coma_scale ?? ''} onChange={(e) => setVitals({ ...vitals, glasgow_coma_scale: e.target.value ? parseInt(e.target.value) : undefined })} hint="3-15" />
                <Input label="Blood Glucose (optional)" type="number" value={vitals.blood_glucose ?? ''} onChange={(e) => setVitals({ ...vitals, blood_glucose: e.target.value ? parseInt(e.target.value) : undefined })} suffix="mg/dL" />
                <Select label="Source of Vitals" value={vitals.source} onChange={(e) => setVitals({ ...vitals, source: e.target.value })}>
                  <option>On-scene paramedic</option>
                  <option>Phone assessment</option>
                  <option>Bystander report</option>
                  <option>Self-reported</option>
                </Select>
              </div>
              <Textarea label="Additional Observations" value={vitals.additional_observations} onChange={(e) => setVitals({ ...vitals, additional_observations: e.target.value })} placeholder="Visible injuries, patient behavior, etc." />
              <Textarea label="Vitals Notes (optional)" value={vitals.notes} onChange={(e) => setVitals({ ...vitals, notes: e.target.value })} placeholder="Additional clinical notes..." />
              <div className="p-3 rounded-lg bg-navy-50/30 text-xs text-navy-500">
                <AlertCircle size={14} className="inline mr-1.5" />
                This system does not diagnose patients or make clinical conclusions. Vitals are recorded for hospital coordination only.
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2"><Check size={18} className="text-navy-600" /><h3 className="text-base font-semibold text-navy-950">Case Summary</h3></div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Please review all information carefully before proceeding to hospital matching. Incorrect data may affect matching results.</p>
              </div>
              <div className="space-y-4">
                <div><h4 className="text-sm font-semibold text-navy-800 mb-2 pb-1 border-b border-navy-50">Call Information</h4>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between"><dt className="text-navy-400">Caller</dt><dd className="text-navy-700">{callInfo.caller_name || 'Unknown'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Phone</dt><dd className="text-navy-700">{callInfo.caller_phone || 'Unknown'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Description</dt><dd className="text-navy-700">{callInfo.emergency_description}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Patients</dt><dd className="text-navy-700">{callInfo.number_of_patients}</dd></div>
                  </dl>
                </div>
                <div><h4 className="text-sm font-semibold text-navy-800 mb-2 pb-1 border-b border-navy-50">Triage</h4>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between"><dt className="text-navy-400">Category</dt><dd className="text-navy-700">{triageCategories.find((t) => t.id === triage.category)?.label || 'Not selected'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Notes</dt><dd className="text-navy-700">{triage.notes || 'None'}</dd></div>
                  </dl>
                </div>
                <div><h4 className="text-sm font-semibold text-navy-800 mb-2 pb-1 border-b border-navy-50">Patient Location</h4>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between"><dt className="text-navy-400">Coordinates</dt><dd className="text-navy-700 font-mono">{location.latitude}, {location.longitude}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Address</dt><dd className="text-navy-700">{location.address || 'Not provided'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">Accuracy</dt><dd className="text-navy-700 capitalize">{location.accuracy}</dd></div>
                  </dl>
                </div>
                <div><h4 className="text-sm font-semibold text-navy-800 mb-2 pb-1 border-b border-navy-50">Vitals</h4>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between"><dt className="text-navy-400">Heart Rate</dt><dd className="text-navy-700">{vitals.heart_rate ? `${vitals.heart_rate} bpm` : 'Not recorded'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">BP</dt><dd className="text-navy-700">{vitals.blood_pressure_systolic ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}` : 'Not recorded'}</dd></div>
                    <div className="flex justify-between"><dt className="text-navy-400">O2 Sat</dt><dd className="text-navy-700">{vitals.oxygen_saturation ? `${vitals.oxygen_saturation}%` : 'Not recorded'}</dd></div>
                  </dl>
                </div>
                {callInfo.additional_notes && <div><h4 className="text-sm font-semibold text-navy-800 mb-2 pb-1 border-b border-navy-50">Additional Notes</h4><p className="text-sm text-navy-600">{callInfo.additional_notes}</p></div>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-50">
            <Button variant="secondary" onClick={() => step > 1 ? setStep(step - 1) : navigate('/dispatch/cases')} disabled={step === 1 && false}>
              <ChevronLeft size={16} /> {step > 1 ? 'Back' : 'Cancel'}
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSave}><Check size={16} /> Save & Match Hospital</Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
