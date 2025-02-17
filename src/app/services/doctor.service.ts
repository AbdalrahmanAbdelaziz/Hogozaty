import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Doctor } from '../shared/models/doctor.model';
import { TimeSlot } from '../shared/models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
    private apiUrl = 'http://89.58.39.164:5000/api/Doctor'; 


  constructor(private http: HttpClient) {}

  getTopDoctors(): Observable<Doctor[]> {
    return this.http.get<{ data: Doctor[] }>(`${this.apiUrl}/getOverallTopTenRatedDoctors`)
      .pipe(map(response => response.data)); 
  }

  getDoctorsBySpecialization(specializationId: number): Observable<Doctor[]> {
    return this.http.get<{ data: Doctor[] }>(`${this.apiUrl}/getDoctorsBySpecializationId/${specializationId}`)
      .pipe(map(response => response.data)); 
  }


  getDoctorsByOptionalParams(params: any): Observable<Doctor[]> {
    return this.http.post<Doctor[]>(`${this.apiUrl}/getDoctorsByOptionalParams`, params);
  }





 
  
  

}
