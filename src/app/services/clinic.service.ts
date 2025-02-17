import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Clinic } from '../shared/models/clinic.model';

export interface ClinicApiResponse {
  data: Clinic;
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private baseUrl = 'http://89.58.39.164:5000/api/Clinic';

  constructor(private http: HttpClient) {}

  // getClinicById(id: number): Observable<Clinic> {
  //   return this.http.get<ClinicApiResponse>(`${this.baseUrl}/getClinic/${id}`).pipe(
  //     map(response => {
  //       
  //       return response.data || { id, name: 'Unknown Clinic' };
  //     })
  //   );
  // }

  getClinicById(clinicId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getClinic/${clinicId}`).pipe(
      map(response => response.data) // Assuming response is { "data": { "id": 1, "name_En": "Clinic Name" } }
    );
  }
  
  
  

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<{ data: Clinic[] }>(`${this.baseUrl}/getAllClinics`)
      .pipe(map(response => response.data));
  }
}
