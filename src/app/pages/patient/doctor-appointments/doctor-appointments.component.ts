import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PHeaderComponent } from '../p-header/p-header.component';
import { UserService } from '../../../services/user.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';

@Component({
  selector: 'app-doctor-appointments',
  imports: [CommonModule, RouterModule, PHeaderComponent, SideNavbarComponent],
  templateUrl: './doctor-appointments.component.html',
  styleUrl: './doctor-appointments.component.css'
})
export class DoctorAppointmentsComponent implements OnInit {
  patient!: LoginResponse;
  availableDays: string[] = [];
  docId!: number;
  specializationId!: number;

  constructor(
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });

    // Get the doctor ID and specialization ID from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('docId');
      const specialization = params.get('specializationId');

      if (id) {
        this.docId = +id;
      } else {
        console.error('Doctor ID is missing');
      }

      if (specialization) {
        this.specializationId = +specialization;
      } else {
        console.error('Specialization ID is missing');
      }

      if (this.docId) {
        this.loadAvailableDays();
      }
    });
  }

  loadAvailableDays(): void {
    const numberOfRequiredDays = 14;

    this.appointmentService.getAvailableDays(this.docId, numberOfRequiredDays).subscribe(
      (response) => {
        this.availableDays = response.data.workingDays || []; // Ensure it's always an array
      },
      (error) => {
        console.error('Error loading available days:', error);
      }
    );
  }

  goToDayAppointments(selectedDate: string): void {
    if (this.docId && this.specializationId) {
      this.router.navigate(['/appointments', this.docId, this.specializationId, selectedDate]);
    } else {
      console.error('Doctor ID or Specialization ID is not available.');
    }
  }
}
