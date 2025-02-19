import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../shared/models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {

  private appointmentData: any = {};

  private baseUrl = 'http://89.58.39.164:5000';

  constructor(private http: HttpClient) {}

  getAvailableDays(docId: number, numberOfRequiredDays: number): Observable<any> {
    const requestBody = { docId, numberOfRequiredDays };
    return this.http.post(`${this.baseUrl}/api/TimeSlot/GetWorkingDaysOfDoctor`, requestBody);
  }

  getTimeSlotsByDate(date: string, doctorId: number): Observable<any> {
    const body = { doctorId, date };
    return this.http.post(`${this.baseUrl}/api/TimeSlot/GetDoctorSlots`, body);
  }
  
     getTimeSlotById(timeSlotId: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/api/TimeSlot/GetTimeSlotById/${timeSlotId}`);
     }
    

     createAppointment(appointmentData: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/api/Appointment/createAppointment`, appointmentData);
    }
    
  

  getAppointments(patientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Appointment/getAppointment/${patientId}`);
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
