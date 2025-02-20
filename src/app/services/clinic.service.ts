import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Clinic } from '../shared/models/clinic.model';
import { BASE_URL } from '../shared/constants/urls';
import { APIResponse } from '../shared/models/api-response.dto';

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
  private baseUrl = BASE_URL + '/api/Clinic';

  constructor(private http: HttpClient) {}

  // getClinicById(id: number): Observable<Clinic> {
  //   return this.http.get<ClinicApiResponse>(`${this.baseUrl}/getClinic/${id}`).pipe(
  //     map(response => {
  //       
  //       return response.data || { id, name: 'Unknown Clinic' };
  //     })
  //   );
  // }

  getClinicById(clinicId: number): Observable<APIResponse<Clinic>> {
    return this.http.get<APIResponse<Clinic>>(`${this.baseUrl}/getClinic/${clinicId}`)
  }
  
  
  

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<{ data: Clinic[] }>(`${this.baseUrl}/getAllClinics`)
      .pipe(map(response => response.data));
  }
}
