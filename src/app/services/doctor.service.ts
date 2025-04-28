import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Doctor } from '../shared/models/doctor.model';
import { TimeSlot } from '../shared/models/appointment.model';
import { BASE_URL } from '../shared/constants/urls';
import { APIResponse } from '../shared/models/api-response.dto';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
    private apiUrl = BASE_URL + '/api/Doctor'; 

  constructor(private http: HttpClient) {}

  getTopDoctors(): Observable<Doctor[]> {
    return this.http.get<{ data: Doctor[] }>(`${this.apiUrl}/getOverallTopTenRatedDoctors`)
      .pipe(map(response => response.data)); 
  }

  getDoctorsBySpecialization(specializationId: number): Observable<Doctor[]> {
    return this.http.get<{ data: Doctor[] }>(`${this.apiUrl}/getDoctorsBySpecializationId/${specializationId}`)
      .pipe(map(response => response.data)); 
  }

  getDoctorsByOptionalParams(params: any): Observable<APIResponse<Doctor[]>> {
    return this.http.post<APIResponse<Doctor[]>>(`${this.apiUrl}/getDoctorsByOptionalParams`, params);
  }

  getAllDoctors(): Observable<APIResponse<Doctor[]>> {
    return this.http.post<APIResponse<Doctor[]>>(`${this.apiUrl}/getAll`, {});
  }

  getDoctorServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getDoctorServices`);
  }

  getAvailableServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAvailableServices`);
  }

  addDoctorServices(services: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/addDoctorServices`, services);
  }

  getDoctorDayFinalRevenue(docId: number, date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/getDoctorDayFinalRevenue`, {
      docId,
      date
    });
  }
}