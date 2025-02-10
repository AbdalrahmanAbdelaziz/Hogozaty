import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserLogin } from '../shared/models/login-request.dto';
import { LOGIN_URL, PATIENT_REGISTER_URL } from '../shared/constants/urls';
import { LoginResponse } from '../shared/models/login-response';

const USER_KEY = 'User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromLocalStorage());
  private userObservable = this.userSubject.asObservable();

  constructor(private http: HttpClient, private toaster: ToastrService) {}

  login(userLogin: UserLogin): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(LOGIN_URL, userLogin).pipe(
      tap({
        next: (response) => {
          this.setUserToLocalStorage(response);
          this.userSubject.next(response);
          this.toaster.success(`Welcome ${response.data.firstName}!`);
        },
        error: () => {
          this.toaster.error('Login Failed');
        }
      })
    );
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem(USER_KEY);
  }

  registerPatient(formData: FormData): Observable<any> {
    return this.http.post<any>(PATIENT_REGISTER_URL, formData).pipe(
      tap({
        next: () => this.toaster.success('Registration Successful'),
        error: (err) => {
          this.toaster.error('Registration Failed');
          console.error('Registration Error:', err);
        }
      })
    );
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  private setUserToLocalStorage(user: LoginResponse) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('userRole', user.data.applicationRole_En);
  }

  private getUserFromLocalStorage(): LoginResponse | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
