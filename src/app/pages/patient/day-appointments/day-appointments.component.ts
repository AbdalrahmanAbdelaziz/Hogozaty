import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { DoctorService } from '../../../services/doctor.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { PHeaderComponent } from '../p-header/p-header.component';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';

@Component({
  selector: 'app-day-appointments',
  imports: [CommonModule, RouterModule, PHeaderComponent, SideNavbarComponent],
  templateUrl: './day-appointments.component.html',
  styleUrl: './day-appointments.component.css'
})
export class DayAppointmentsComponent implements OnInit {
  patient!: LoginResponse;
  selectedDate: string = '';
  timeSlots: any[] = [];
  doctorId: number = 0;
  clinicId: number = 0;    
  specializationId: number = 0;
  

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,    
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });

    this.selectedDate = this.route.snapshot.paramMap.get('date') || '';
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId')) || 0;
    this.specializationId = Number(this.route.snapshot.paramMap.get('specializationId')) || 0;

    if (this.selectedDate && this.doctorId) {
      this.loadDoctorDetails(); // ✅ Ensure doctor details load first
      this.loadTimeSlots();
    } else {
      console.error('Date or Doctor ID is missing from route parameters.');
    }
  }

  loadDoctorDetails(): void {
    console.log('Fetching doctor details with doctorId:', this.doctorId);
  
    this.doctorService.getDoctorsBySpecialization(this.doctorId).subscribe(
      (doctors) => {
        if (doctors && doctors.length > 0) { // ✅ Ensure at least one doctor exists
          const doctor = doctors[0]; // ✅ Pick the first doctor from the array
          this.clinicId = doctor.clinicId;
          this.specializationId = doctor.specializationId;
          console.log('Updated Clinic ID:', this.clinicId);
          console.log('Updated Specialization ID:', this.specializationId);
        } else {
          console.warn('No doctor found with the given specialization ID.');
        }
      },
      (error) => {
        console.error('Error fetching doctor details:', error);
      }
    );
  }
  

  loadTimeSlots(): void {
    this.appointmentService.getTimeSlotsByDate(this.selectedDate, this.doctorId).subscribe(
      (response) => {
        this.timeSlots = response.data || [];
      },
      (error) => {
        console.error('Error loading time slots:', error);
      }
    );
  }

  bookAppointment(timeSlot: any): void {
    console.log('Booking appointment with:', {
      date: this.selectedDate,
      slotId: timeSlot.id,
      doctorId: this.doctorId,
      clinicId: this.clinicId,
      specializationId: this.specializationId
    });

    this.router.navigate(['/confirm-booking'], {
      queryParams: {
        date: this.selectedDate,
        slotId: timeSlot.id,
        doctorId: this.doctorId,  
        specializationId: this.specializationId,
      
      }
    });
  }
}
