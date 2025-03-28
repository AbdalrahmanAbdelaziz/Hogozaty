import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root',
})
export class ServiceOfDoctor {
  private apiUrl = BASE_URL + '/api/Services'; 

  constructor(private http: HttpClient) {}

  // Fetch services by doctorId
  getServicesByDoctorId(doctorId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getServicesByDoctorId/${doctorId}`);
  }

  // Fetch services by specializationId
  getServicesBySpecializationId(specializationId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getServiceBySpecializationId/${specializationId}`);
  }

  // Assign a service to a doctor
  assignServiceToDoctor(requestBody: {
    doctorPriceForService: number;
    doctorAvgDurationForServiceInMinutes: number;
    specializationServiceId: number;
    doctorId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignServiceToDoctor`, requestBody);
  }

  // DoctorassignServiceToDoctor(requestBody: {
  //   doctorPriceForService: number;
  //   doctorAvgDurationForServiceInMinutes: number;
  //   specializationServiceId: number;
  //   doctorId: number;
  // }): Observable<any> {
  //   const url = `${this.apiUrl}/DoctorService/AssignServiceToDoctor`;
  //   return this.http.post(url, requestBody);
  // }
}