import { useState, useMemo } from 'react';
import { BedDouble, TrendingUp, Clock, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';

export function BedAvailabilityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const [newAvailable, setNewAvailable] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);
  const [error, setError] = useState('');

  const hospital = useMemo(
    () => mockService.getHospitals().find((h) => h.id === user?.hospital_id),
    [user, refresh]
  );

  if (!hospital) return <div><PageHeader title="Bed Availability" /><Card><p className="p-4 text-sm text-navy-400">No hospital assigned.</p></Card></div>;

  const occupied = hospital.max_bed_capacity - hospital.available_beds;
  const utilization = Math.round((occupied / hospital.max_bed_capacity) * 100);

  const handleUpdate = () => {
    const val = parseInt(newAvailable);
    if (isNaN(val)) { setError('Please enter a valid number.'); return; }
    if (val < 0) { setError('Available beds cannot be negative.'); return; }
    if (val > hospital.max_bed_capacity) { setError(`Cannot exceed maximum capacity of ${hospital.max_bed_capacity}.`); return; }
    setError('');
    setConfirmSave(true);
  };

  const doSave = () => {
    mockService.updateBedAvailability(hospital.id, parseInt(newAvailable));
    mockService.addActivityLog({ user: user?.full_name || 'Unknown', role: 'health_partner', action: 'Bed Availability Updated', description: `Updated available beds at ${hospital.name} to ${newAvailable}.`, status: 'info' });
    toast('success', 'Bed availability updated successfully.');
    setNewAvailable('');
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title="Bed Availability Management"
        description="Update and monitor your hospital's bed capacity in real-time."
        breadcrumbs={[{ label: 'Health Partner' }, { label: 'Bed Availability' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardBody><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center"><BedDouble size={20} className="text-navy-600" /></div><div><p className="text-sm text-navy-400">Max Capacity</p><p className="text-xl font-bold text-navy-950">{hospital.max_bed_capacity}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><BedDouble size={20} className="text-green-600" /></div><div><p className="text-sm text-navy-400">Available</p><p className="text-xl font-bold text-green-600">{hospital.available_beds}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><TrendingUp size={20} className="text-amber-600" /></div><div><p className="text-sm text-navy-400">Occupied</p><p className="text-xl font-bold text-amber-600">{occupied}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp size={20} className="text-accent" /></div><div><p className="text-sm text-navy-400">Utilization</p><p className="text-xl font-bold text-navy-950">{utilization}%</p></div></div></CardBody></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Update Available Beds</CardTitle></CardHeader>
          <CardBody>
            <div className="mb-4">
              <div className="h-4 bg-navy-50 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${utilization > 80 ? 'bg-red-400' : utilization > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${utilization}%` }} />
              </div>
              <div className="flex justify-between text-xs text-navy-400">
                <span>{occupied} occupied</span>
                <span>{hospital.available_beds} available</span>
              </div>
            </div>
            <Input
              label="New Available Bed Count"
              type="number"
              value={newAvailable}
              onChange={(e) => setNewAvailable(e.target.value)}
              error={error}
              hint={`Must be between 0 and ${hospital.max_bed_capacity}`}
              placeholder="Enter available bed count"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-navy-400">
              <Clock size={14} />
              <span>Last updated: {new Date(hospital.services[0]?.last_updated || Date.now()).toLocaleString()}</span>
            </div>
            <Button className="mt-4 w-full" onClick={handleUpdate} disabled={!newAvailable}>
              <Save size={16} /> Save Update
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Availability History</CardTitle></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => {
                const beds = Math.max(0, hospital.available_beds + Math.round((Math.random() - 0.5) * 30) - i * 3);
                const time = new Date(Date.now() - i * 3600000 * 4);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-navy-50/30">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-navy-400" />
                      <span className="text-xs text-navy-400">{time.toLocaleString()}</span>
                    </div>
                    <span className="text-sm font-medium text-navy-800">{beds} beds available</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xs text-navy-500">
                Future updates will support department-specific bed tracking (ICU, Maternity, etc.).
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={doSave}
        title="Confirm Bed Update"
        message={`Update available beds from ${hospital.available_beds} to ${newAvailable}?`}
        confirmLabel="Confirm"
        variant="primary"
      />
    </div>
  );
}
