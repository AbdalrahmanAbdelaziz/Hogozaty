import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppointmentService } from '../../../services/appointment.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { Observable, take } from 'rxjs';

// Define the Appointment interface
interface Appointment {
  appointmentStatusId: number;
}

@Component({
  selector: 'app-s-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SHeaderComponent,
    SideNavbarComponent,
    NgxChartsModule,
  ],
  templateUrl: './s-home.component.html',
  styleUrls: ['./s-home.component.css'],
})
export class SHomeComponent implements OnInit {
  view: [number, number] = [700, 400];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C'],
  };
  pieChartData: any[] = [];
  showLegend = true;
  showLabels = true;
  isDoughnut = false;
  doctorId: number | null = null;
  todayDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');

  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const user: LoginResponse | null = this.userService.getUser();
  
    console.log('Retrieved user data:', user); // Debugging log
  
    if (!user) {
      console.warn('No user data found.');
      return;
    }
  
    if (user.data.applicationRole_En === 'Secretary') {
      if (user.data.doctorId) {
        this.doctorId = user.data.doctorId;
      } else {
        console.error('Error: Secretary login response does not contain a doctorId.');
      }
    } else if (user.data.applicationRole_En === 'Doctor') {
      this.doctorId = user.data.id;
    }
  
    // Fallback: Load from local storage if doctorId is missing
    if (!this.doctorId) {
      const storedDoctorId = localStorage.getItem('doctorId');
      if (storedDoctorId) {
        this.doctorId = Number(storedDoctorId);
        console.log('Loaded doctor ID from storage:', this.doctorId);
      }
    }
  
    if (this.doctorId) {
      console.log('Doctor ID:', this.doctorId); // Confirm doctorId retrieval
      this.loadAppointmentData();
    } else {
      console.warn('No doctor ID found.');
    }
  }

  loadAppointmentData(): void {
    if (!this.doctorId) return;

    this.appointmentService
  .getDoctorDayAppointmentsCount(this.doctorId, this.todayDate)
  .pipe(take(1))
  .subscribe({
    next: (response) => {
      console.log('API Response:', response);

      // Ensure we are accessing the correct property
      const appointments: Appointment[] = Array.isArray(response) ? response : response.appointments || [];

      const arrived = appointments.filter(a => a.appointmentStatusId === 2).length;
      const pending = appointments.filter(a => a.appointmentStatusId === 1).length;
      const canceled = appointments.filter(a => a.appointmentStatusId === 3).length;

      this.pieChartData = [
        { name: 'Arrived Appointments', value: arrived },
        { name: 'Pending Appointments', value: pending },
        { name: 'Canceled Appointments', value: canceled },
      ];
    },
    error: (err) => {
      console.error('Error fetching appointment data:', err);
    },
  });

  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }
}
