export interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: number;
  timeSlotStatusId: number;
}

export interface Appointment {
  id?: number; // Made optional since it's usually auto-generated when creating an appointment
  notes: string;
  timeSlot: TimeSlot; // ✅ Keep the entire timeSlot object instead of separate fields
  appointmentStatusId?: number; // Made optional for creation
  appointmentStatus_Ar?: string;
  appointmentStatus_En?: string;
  clinicId: number;
  doctorId: number;
  doctorName?: string; // Made optional if not required at creation time
  doctorSpecialization_En?: string | null;
  doctorSpecialization_Ar?: string | null;
  patientID: number;
  patientName?: string; // Made optional if not required at creation time
  appointmentServicesPivots?: any[]; // Made optional for flexibility
  medicalRecordEntryId?: number; // Made optional if it's assigned later
  medicalRecordEntry?: any;
  feedbacks?: any[];
}
