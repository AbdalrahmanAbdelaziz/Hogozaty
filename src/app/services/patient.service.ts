import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = BASE_URL;  // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Check if the phone number is registered
  checkPatientByPhone(phoneNumber: string): Observable<{ patientId?: string }> {
    return this.http.get<{ patientId?: string }>(`${this.apiUrl}/check/${phoneNumber}`);
  }
}
