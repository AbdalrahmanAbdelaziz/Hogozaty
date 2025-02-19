import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://89.58.39.164:5000';  // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Check if the phone number is registered
  checkPatientByPhone(phoneNumber: string): Observable<{ patientId?: string }> {
    return this.http.get<{ patientId?: string }>(`${this.apiUrl}/check/${phoneNumber}`);
  }
}
