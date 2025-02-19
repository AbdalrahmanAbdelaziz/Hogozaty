import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-new-patient',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SHeaderComponent,
    SideNavbarComponent
  ],
  templateUrl: './new-patient.component.html',
  styleUrl: './new-patient.component.css'
})
export class NewPatientComponent implements OnInit {
  phoneNumber: string = '';
  patientId: string | null = null;
  isRegistered: boolean | null = null; // null initially

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit(): void {}

  checkRegistration() {
    this.patientService.checkPatientByPhone(this.phoneNumber).subscribe(
      (response) => {
        if (response.patientId) {
          this.patientId = response.patientId;
          this.isRegistered = true;
        } else {
          this.isRegistered = false;
        }
      },
      (error) => {
        console.error('Error checking registration:', error);
        this.isRegistered = false;
      }
    );
  }

  goToRegister() {
    this.router.navigate(['/add-patient-phone']); 
  }

  goToAppointments(docId: string, specializationId: string) {
    if (this.patientId) {
      this.router.navigate([`/doctor-appointments/${docId}/${specializationId}/${this.patientId}`]);
    }
  }
}
