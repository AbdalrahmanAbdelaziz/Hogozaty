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
    return this.http.delete(`${this.baseUrl}/api/Appointment/cancelAppointment/${appointmentId}`);
  }


}
