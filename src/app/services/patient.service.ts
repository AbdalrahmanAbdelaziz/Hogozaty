import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../shared/constants/urls';
import { LoginResponse } from '../shared/models/login-response';
import { APIResponse } from '../shared/models/api-response.dto';
import { Patient } from '../shared/models/patient';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = BASE_URL;  

  constructor(private http: HttpClient) {}

  // Check if the phone number is registered
  checkPatientByPhone(phoneNumber: string): Observable<{ data: number, statusCode: number, succeeded: boolean, message: string, errors: any[] }> {
    return this.http.get<{ data: number, statusCode: number, succeeded: boolean, message: string, errors: any[] }>(
      `${this.apiUrl}/api/Patient/getPatientIdByPhoneNumber/${phoneNumber}`
    );
  }

  // Fetch patient details by ID
  getPatientById(patientId: number): Observable<APIResponse<Patient>> {
    return this.http.get<APIResponse<Patient>>(`${this.apiUrl}/api/Patient/getPatientById/${patientId}`);
  }

 
  updatePatientProfile(patientId: number, formData: FormData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/Patient/updatePatientProfile/${patientId}`, formData);
  }

 

  getPatientsByDoctorId(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/Patient/getPatientsOfDoctor/${doctorId}`);
  }


  getVisitHistory(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/${patientId}`);
  }
  
  uploadFile(file: File, appointmentId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', appointmentId.toString());
    
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  submitDiagnosis(visitDetails: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/`);
  }

  getMedicalRecordsByPatient(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/${patientId}`);
  }



}