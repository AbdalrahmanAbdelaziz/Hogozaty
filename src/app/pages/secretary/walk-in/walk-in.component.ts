import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
@Component({
  selector: 'app-walk-in',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SHeaderComponent,
    SideNavbarComponent
  ],
  templateUrl: './walk-in.component.html',
  styleUrl: './walk-in.component.css'
})
export class WalkInComponent implements OnInit{

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
    this.router.navigate(['/complete-data']); 
  }

  goToAppointments(docId: string, specializationId: string) {
    if (this.patientId) {
      this.router.navigate([`/doctor-appointments/${docId}/${specializationId}/${this.patientId}`]);
    }
  }
}

