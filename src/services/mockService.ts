import { mockUsers, mockHospitals, mockEmergencyCases, mockNotifications, mockActivityLogs } from '@/data/mockData';
import type {
  User,
  Hospital,
  EmergencyCase,
  Notification,
  ActivityLog,
  HospitalService,
  Ambulance,
  HospitalMatch,
  TriageCategory,
  CaseStatus,
  AmbulanceStatus,
  PartnerStatus,
  HospitalLevel,
} from '@/types';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let users = [...mockUsers];
let hospitals = [...mockHospitals];
let emergencyCases = [...mockEmergencyCases];
let notifications = [...mockNotifications];
let activityLogs = [...mockActivityLogs];

export const mockService = {
  // Auth
  async login(email: string, _password: string): Promise<User | null> {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },
  async registerParamedic(data: {
    full_name: string;
    email: string;
    phone: string;
    professional_registration: string;
  }): Promise<User> {
    const newUser: User = {
      id: `u-param-${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role: 'paramedic',
      status: 'pending',
      professional_registration: data.professional_registration,
      registration_date: new Date().toISOString(),
      avatar_color: '#5B65DC',
    };
    users = [...users, newUser];
    return newUser;
  },

  // Users
  getUsers() {
    return [...users];
  },
  getParamedics() {
    return users.filter((u) => u.role === 'paramedic');
  },
  getPendingParamedics() {
    return users.filter((u) => u.role === 'paramedic' && u.status === 'pending');
  },
  updateUserStatus(userId: string, status: User['status']): void {
    users = users.map((u) => (u.id === userId ? { ...u, status } : u));
  },
  getUserById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  },
  getUserByHospitalId(hospitalId: string): User | undefined {
    return users.find((u) => u.hospital_id === hospitalId);
  },

  // Hospitals
  getHospitals(): Hospital[] {
    return [...hospitals];
  },
  getHospitalById(id: string): Hospital | undefined {
    return hospitals.find((h) => h.id === id);
  },
  getActiveHospitals(): Hospital[] {
    return hospitals.filter((h) => h.partner_status === 'active');
  },
  getSuspendedHospitals(): Hospital[] {
    return hospitals.filter((h) => h.partner_status === 'suspended');
  },
  addHospital(data: {
    name: string;
    level: HospitalLevel;
    latitude: number;
    longitude: number;
    location: string;
    max_bed_capacity: number;
  }): Hospital {
    const id = `h-${Date.now()}`;
    const newHospital: Hospital = {
      id,
      name: data.name,
      level: data.level,
      latitude: data.latitude,
      longitude: data.longitude,
      location: data.location,
      max_bed_capacity: data.max_bed_capacity,
      available_beds: data.max_bed_capacity,
      partner_status: 'active',
      registration_date: new Date().toISOString(),
      services: ['Trauma Care', 'ICU', 'Maternity', 'Blood Bank'].map((name, i) => ({
        id: `svc-${id}-${i}`,
        hospital_id: id,
        name,
        description: '',
        status: 'available' as const,
        last_updated: new Date().toISOString(),
      })),
      ambulances: [],
    };
    hospitals = [...hospitals, newHospital];
    return newHospital;
  },
  updateHospitalStatus(id: string, status: PartnerStatus): void {
    hospitals = hospitals.map((h) =>
      h.id === id ? { ...h, partner_status: status } : h
    );
  },
  updateHospital(id: string, data: Partial<Hospital>): void {
    hospitals = hospitals.map((h) => (h.id === id ? { ...h, ...data } : h));
  },
  deleteHospital(id: string): void {
    hospitals = hospitals.filter((h) => h.id !== id);
  },
  updateBedAvailability(id: string, availableBeds: number): void {
    hospitals = hospitals.map((h) =>
      h.id === id
        ? { ...h, available_beds: availableBeds, services: h.services.map((s) => ({ ...s, last_updated: new Date().toISOString() })) }
        : h
    );
  },

  // Services
  addService(hospitalId: string, data: { name: string; description: string; status: HospitalService['status'] }): HospitalService {
    const svc: HospitalService = {
      id: `svc-${hospitalId}-${Date.now()}`,
      hospital_id: hospitalId,
      name: data.name,
      description: data.description,
      status: data.status,
      last_updated: new Date().toISOString(),
    };
    hospitals = hospitals.map((h) =>
      h.id === hospitalId ? { ...h, services: [...h.services, svc] } : h
    );
    return svc;
  },
  updateService(hospitalId: string, serviceId: string, data: Partial<HospitalService>): void {
    hospitals = hospitals.map((h) =>
      h.id === hospitalId
        ? {
            ...h,
            services: h.services.map((s) =>
              s.id === serviceId ? { ...s, ...data, last_updated: new Date().toISOString() } : s
            ),
          }
        : h
    );
  },
  deleteService(hospitalId: string, serviceId: string): void {
    hospitals = hospitals.map((h) =>
      h.id === hospitalId
        ? { ...h, services: h.services.filter((s) => s.id !== serviceId) }
        : h
    );
  },

  // Ambulances
  addAmbulance(hospitalId: string, data: { plate_number: string; identifier: string; type: string; status: AmbulanceStatus }): Ambulance {
    const amb: Ambulance = {
      id: `amb-${hospitalId}-${Date.now()}`,
      hospital_id: hospitalId,
      plate_number: data.plate_number,
      identifier: data.identifier,
      type: data.type,
      status: data.status,
      last_updated: new Date().toISOString(),
    };
    hospitals = hospitals.map((h) =>
      h.id === hospitalId ? { ...h, ambulances: [...h.ambulances, amb] } : h
    );
    return amb;
  },
  updateAmbulance(hospitalId: string, ambulanceId: string, data: Partial<Ambulance>): void {
    hospitals = hospitals.map((h) =>
      h.id === hospitalId
        ? {
            ...h,
            ambulances: h.ambulances.map((a) =>
              a.id === ambulanceId ? { ...a, ...data, last_updated: new Date().toISOString() } : a
            ),
          }
        : h
    );
  },
  deleteAmbulance(hospitalId: string, ambulanceId: string): void {
    hospitals = hospitals.map((h) =>
      h.id === hospitalId
        ? { ...h, ambulances: h.ambulances.filter((a) => a.id !== ambulanceId) }
        : h
    );
  },

  // Emergency Cases
  getEmergencyCases(): EmergencyCase[] {
    return [...emergencyCases];
  },
  getEmergencyCaseById(id: string): EmergencyCase | undefined {
    return emergencyCases.find((c) => c.id === id);
  },
  createEmergencyCase(data: Partial<EmergencyCase>): EmergencyCase {
    const id = `ec-${Date.now()}`;
    const now = new Date().toISOString();
    const newCase: EmergencyCase = {
      id,
      case_reference: `RL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(emergencyCases.length + 1).padStart(3, '0')}`,
      call_received_time: now,
      dispatcher_name: data.dispatcher_name || 'Unknown',
      caller_name: data.caller_name,
      caller_phone: data.caller_phone,
      emergency_description: data.emergency_description || '',
      number_of_patients: data.number_of_patients || 1,
      additional_notes: data.additional_notes,
      triage_category: data.triage_category || 'yellow_amber',
      priority_level: data.priority_level || 3,
      triage_notes: data.triage_notes,
      triage_timestamp: data.triage_timestamp || now,
      patient_latitude: data.patient_latitude || 0,
      patient_longitude: data.patient_longitude || 0,
      location_address: data.location_address,
      location_accuracy: data.location_accuracy || 'medium',
      location_notes: data.location_notes,
      vitals: data.vitals,
      status: data.status || 'new',
      assigned_hospital_id: data.assigned_hospital_id,
      assigned_ambulance_id: data.assigned_ambulance_id,
      created_time: now,
      updated_time: now,
      timeline: data.timeline || [{ id: `t-${Date.now()}`, event: 'Case Created', timestamp: now, description: 'Emergency hotline call received.' }],
    };
    emergencyCases = [newCase, ...emergencyCases];
    return newCase;
  },
  updateEmergencyCase(id: string, data: Partial<EmergencyCase>): void {
    emergencyCases = emergencyCases.map((c) =>
      c.id === id ? { ...c, ...data, updated_time: new Date().toISOString() } : c
    );
  },
  addTimelineEvent(caseId: string, event: string, description?: string): void {
    const tlEvent = {
      id: `t-${Date.now()}`,
      event,
      timestamp: new Date().toISOString(),
      description,
    };
    emergencyCases = emergencyCases.map((c) =>
      c.id === caseId ? { ...c, timeline: [...c.timeline, tlEvent] } : c
    );
  },

  // Hospital Matching
  matchHospitals(
    patientLat: number,
    patientLon: number,
    triage: TriageCategory,
    requiredServices: string[] = []
  ): HospitalMatch[] {
    const activeHospitals = hospitals.filter((h) => h.partner_status === 'active');
    return activeHospitals
      .map((h) => {
        const distance = haversineDistance(patientLat, patientLon, h.latitude, h.longitude);
        const speed = 30;
        const travelMin = (distance / speed) * 60;
        const travelTime = travelMin < 60 ? `${Math.round(travelMin)} min` : `${Math.floor(travelMin / 60)}h ${Math.round(travelMin % 60)}min`;
        const availableAmbulances = h.ambulances.filter((a) => a.status === 'available').length;
        const reasons: string[] = [];
        let servicesAvailable = true;
        if (requiredServices.length > 0) {
          for (const req of requiredServices) {
            const svc = h.services.find((s) => s.name.toLowerCase() === req.toLowerCase());
            if (!svc) {
              servicesAvailable = false;
              reasons.push(`Missing service: ${req}`);
            } else if (svc.status === 'suspended') {
              servicesAvailable = false;
              reasons.push(`Service unavailable: ${req}`);
            }
          }
        }
        let isSuitable = true;
        if (h.available_beds === 0) {
          isSuitable = false;
          reasons.push('No beds available');
        }
        if (!servicesAvailable) {
          isSuitable = false;
        }
        if (triage === 'pure_red' && h.level < 4) {
          isSuitable = false;
          reasons.push('Hospital level too low for Pure Red triage');
        }
        if (triage === 'orange_red' && h.level < 3) {
          isSuitable = false;
          reasons.push('Hospital level too low for Orange-Red triage');
        }
        return {
          hospital: h,
          distance_km: Math.round(distance * 10) / 10,
          estimated_travel_time: travelTime,
          required_services_available: servicesAvailable,
          available_beds: h.available_beds,
          ambulances_available: availableAmbulances,
          is_suitable: isSuitable,
          reasons,
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);
  },

  // Notifications
  getNotifications(role: string, userId?: string): Notification[] {
    return notifications.filter(
      (n) => n.role === role && (!n.user_id || n.user_id === userId)
    );
  },
  markNotificationRead(id: string): void {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  },
  markAllNotificationsRead(role: string, userId?: string): void {
    notifications = notifications.map((n) =>
      n.role === role && (!n.user_id || n.user_id === userId) ? { ...n, read: true } : n
    );
  },

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return [...activityLogs];
  },
  addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    activityLogs = [
      { ...log, id: `a-${Date.now()}`, timestamp: new Date().toISOString() },
      ...activityLogs,
    ];
  },

  // Case status helpers
  getCaseStatusOptions(currentStatus: CaseStatus): { value: CaseStatus; label: string }[] {
    const flow: Record<CaseStatus, CaseStatus[]> = {
      new: ['assessment_in_progress', 'cancelled'],
      assessment_in_progress: ['matching', 'cancelled'],
      matching: ['awaiting_confirmation', 'cancelled'],
      awaiting_confirmation: ['hospital_confirmed', 'matching', 'cancelled'],
      hospital_confirmed: ['ambulance_assigned', 'cancelled'],
      ambulance_assigned: ['dispatched', 'cancelled'],
      dispatched: ['in_transit', 'cancelled'],
      in_transit: ['arrived', 'cancelled'],
      arrived: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return (flow[currentStatus] || []).map((s) => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));
  },
};
