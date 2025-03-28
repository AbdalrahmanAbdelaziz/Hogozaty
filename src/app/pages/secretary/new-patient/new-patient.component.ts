import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-new-patient',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SHeaderComponent,
    SSidenavbarComponent
  ],
  templateUrl: './new-patient.component.html',
  styleUrl: './new-patient.component.css'
})
export class NewPatientComponent implements OnInit {
  phoneNumber: string = '';
  patientId: number | null = null;
  isRegistered: boolean | null = null; // null initially

  constructor(
    private patientService: PatientService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  checkRegistration() {
    if (!this.phoneNumber) {
      console.error('Phone number is required.');
      return;
    }

    this.patientService.checkPatientByPhone(this.phoneNumber).subscribe(
      (response) => {
        if (response.succeeded && response.data > 0) {
          this.patientId = response.data; // Set the patientId
          this.isRegistered = true; // Patient is registered
          console.log('Patient is registered with ID:', this.patientId);
        } else {
          this.patientId = null; // Reset patientId
          this.isRegistered = false; // Patient is not registered
          console.log('Patient is not registered.');
        }
      },
      (error) => {
        console.error('Error checking registration:', error);
        this.isRegistered = false; // Handle error case
        this.patientId = null; // Reset patientId
      }
    );
  }

  goToRegister() {
    const user: LoginResponse | null = this.userService.getUser();
    if (user && user.data.doctorId) {
      // Pass the phone number as a query parameter
      this.router.navigate(['/add-patient-phone'], {
        queryParams: { 
          docId: user.data.doctorId,
          phoneNumber: this.phoneNumber // Pass the phone number here
        }
      });
    } else {
      console.error('Error: Secretary login response does not contain a doctorId.');
    }
  }

  goToAppointments() {
    const user: LoginResponse | null = this.userService.getUser();
    if (user && user.data.doctorId && this.patientId) {
      // Navigate to the doctor appointments page with the doctorId and patientId
      this.router.navigate([`/sec-doctor-appointments/${user.data.doctorId}/${this.patientId}`]);
    } else {
      console.error('Doctor ID or Patient ID is not available.');
    }
  }
}