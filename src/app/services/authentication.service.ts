import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { APIResponse } from '../shared/models/api-response.dto';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { LoginResponse } from '../shared/models/login-response';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router'; // Import Router

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _httpClient = inject(HttpClient);
  private _envService = inject(EnvironmentService);
  private _toastr = inject(ToastrService);  
  private _router = inject(Router);  // Inject Router

  addNewPatient(formData: FormData): Observable<APIResponse<LoginResponse>> {
    return this._httpClient.post<APIResponse<LoginResponse>>(
      `${this._envService.getApiUrl()}/api/Authentiction/createPatient`, 
      formData
    ).pipe(
      tap({
        next: () => {
          this._toastr.success("Patient registered successfully!"); 
          
          // this._router.navigate(['/login']);
        },
        error: (err) => {
          this._toastr.error("Failed to register patient, Please try again."); 
        }
      })
    );
  }

}
