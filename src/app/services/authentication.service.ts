import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { APIResponse } from '../shared/models/api-response.dto';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { UserLogin } from '../shared/models/login-request.dto';
import { LoginResponse } from '../shared/models/login-response';
import { UserRolesEnum } from '../shared/enum/user-role.enum';
import { PatientRegister } from '../shared/models/patient_register';

@Injectable({
    providedIn: 'root'
  })
  export class AuthenticationService {
    private _httpClient = inject(HttpClient);
    private _envService = inject(EnvironmentService);
  
    addNewPatient(formData: FormData): Observable<APIResponse<LoginResponse>> {
      return this._httpClient.post<APIResponse<LoginResponse>>(
        `${this._envService.getApiUrl()}/api/Authentiction/createPatient`, 
        formData
      ).pipe(
        tap({
          next: () => console.log("Patient registered successfully"),
          error: (err) => console.error("Registration error:", err)
        })
      );
    }
  
    login(loginRequest: UserLogin): Observable<APIResponse<LoginResponse>> {
      return this._httpClient.post<APIResponse<LoginResponse>>(
        `${this._envService.getApiUrl()}/api/Authentiction/login`, 
        loginRequest
      );
    }
  
    logout() {
      localStorage.clear();
    }
  }
  