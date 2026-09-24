export type UserRole = 'super_admin' | 'health_partner' | 'paramedic';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type HospitalLevel = 2 | 3 | 4 | 5 | 6;

export type PartnerStatus = 'active' | 'suspended';

export type ServiceStatus = 'available' | 'suspended';

export type AmbulanceStatus =
  | 'available'
  | 'dispatched'
  | 'on_mission'
  | 'maintenance'
  | 'unavailable';

export type TriageCategory =
  | 'pure_red'
  | 'orange_red'
  | 'yellow_amber'
  | 'light_green'
  | 'pure_green';

export type CaseStatus =
  | 'new'
  | 'assessment_in_progress'
  | 'matching'
  | 'awaiting_confirmation'
  | 'hospital_confirmed'
  | 'ambulance_assigned'
  | 'dispatched'
  | 'in_transit'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export type NotificationType =
  | 'registration'
  | 'suspension'
  | 'service_change'
  | 'bed_alert'
  | 'ambulance_update'
  | 'emergency'
  | 'matching'
  | 'system';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: ApprovalStatus;
  hospital_id?: string;
  professional_registration?: string;
  registration_date: string;
  last_login?: string;
  avatar_color: string;
}

export interface Hospital {
  id: string;
  name: string;
  level: HospitalLevel;
  latitude: number;
  longitude: number;
  location: string;
  max_bed_capacity: number;
  available_beds: number;
  partner_status: PartnerStatus;
  registration_date: string;
  admin_id?: string;
  services: HospitalService[];
  ambulances: Ambulance[];
}

export interface HospitalService {
  id: string;
  hospital_id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  last_updated: string;
}

export interface Ambulance {
  id: string;
  hospital_id: string;
  plate_number: string;
  identifier: string;
  type: string;
  status: AmbulanceStatus;
  last_updated: string;
}

export interface EmergencyCase {
  id: string;
  case_reference: string;
  call_received_time: string;
  dispatcher_name: string;
  caller_name?: string;
  caller_phone?: string;
  emergency_description: string;
  number_of_patients: number;
  additional_notes?: string;
  triage_category: TriageCategory;
  priority_level: number;
  triage_notes?: string;
  triage_timestamp: string;
  patient_latitude: number;
  patient_longitude: number;
  location_address?: string;
  location_accuracy: string;
  location_notes?: string;
  vitals?: PatientVitals;
  status: CaseStatus;
  assigned_hospital_id?: string;
  assigned_ambulance_id?: string;
  created_time: string;
  updated_time: string;
  timeline: TimelineEvent[];
}

export interface PatientVitals {
  temperature?: number;
  temperature_unit: string;
  heart_rate?: number;
  respiratory_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  oxygen_saturation?: number;
  glasgow_coma_scale?: number;
  blood_glucose?: number;
  additional_observations?: string;
  source: string;
  time_recorded: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  timestamp: string;
  description?: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  role: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface HospitalMatch {
  hospital: Hospital;
  distance_km: number;
  estimated_travel_time: string;
  required_services_available: boolean;
  available_beds: number;
  ambulances_available: number;
  is_suitable: boolean;
  reasons: string[];
}
