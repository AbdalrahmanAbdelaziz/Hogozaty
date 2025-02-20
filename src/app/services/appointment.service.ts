import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, TimeSlot } from '../shared/models/appointment.model';
import { BASE_URL } from '../shared/constants/urls';
import { APIResponse } from '../shared/models/api-response.dto';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {

  private appointmentData: any = {};

  private baseUrl = BASE_URL;

  constructor(private http: HttpClient) {}

  getAvailableDays(docId: number, numberOfRequiredDays: number): Observable<any> {
    const requestBody = { docId, numberOfRequiredDays };
    return this.http.post(`${this.baseUrl}/api/TimeSlot/GetWorkingDaysOfDoctor`, requestBody);
  }

  getTimeSlotsByDate(date: string, doctorId: number): Observable<any> {
    const body = { doctorId, date };
    return this.http.post(`${this.baseUrl}/api/TimeSlot/GetDoctorSlots`, body);
  }
  
     getTimeSlotById(timeSlotId: number): Observable<APIResponse<TimeSlot>> {
      return this.http.get<APIResponse<TimeSlot>>(`${this.baseUrl}/api/TimeSlot/GetByIdAsync/${timeSlotId}`);
     }
    

     createAppointment(appointmentData: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/api/Appointment/createAppointment`, appointmentData);
    }
    
  

    getAppointments(patientId: number): Observable<any> {
      const requestBody = {
        appointmentId: 0,
        doctorId: 0,
        doctortFirstName: "",
        doctorLastName: "",
        clinicId: 0,
        specializationId: 0,
        status: "",
        patientId: patientId // Pass the patient ID here
      };
    
      return this.http.post(`${this.baseUrl}/api/Appointment/SearchForAppointmentsByOptionalParams`, requestBody);
    }
    
    



  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/Appointment/cancelAppointment/${appointmentId}`, {});
  }
  


////////////////////////////////////////////////////////////


getAppointmentStats(): Observable<any> {
  return this.http.get(`${this.baseUrl}/api/Appointment/getAppointmentStats`);
}

reserveAppointment(appointmentData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/appointments/book`, appointmentData);
}


rescheduleAppointment(appointmentId: number, newDate: string): Observable<void> {
  return this.http.patch<void>(`${this.baseUrl}/${appointmentId}/reschedule`, { newDate });
}


getAppointmentsByDate(date: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}?date=${date}`);
}

markArrived(appointmentId: number): Observable<void> {
  return this.http.patch<void>(`${this.baseUrl}/${appointmentId}/arrived`, {});
}

markCheckIn(appointmentId: number): Observable<void> {
  return this.http.patch<void>(`${this.baseUrl}/${appointmentId}/checkin`, {});
}

markDone(appointmentId: number): Observable<void> {
  return this.http.patch<void>(`${this.baseUrl}/${appointmentId}/done`, {});
}


getDoctorDayAppointmentsCount(docId: number, date: string): Observable<any> {
  const requestBody = { docId, date };
  return this.http.post(`${this.baseUrl}/api/Doctor/getDoctorDayAppointmentsCount`, requestBody);
}







}
