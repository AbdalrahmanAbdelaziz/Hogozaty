import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DSidenavbarComponent } from '../d-sidenavbar/d-sidenavbar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppointmentService } from '../../../services/appointment.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { Observable, take } from 'rxjs';
import { AppointmentStats } from '../../../shared/models/appointment-stats.model';
import { DHeaderComponent } from '../d-header/d-header.component';

@Component({
  selector: 'app-d-home',
  imports: [
      CommonModule,
      RouterModule,
      DHeaderComponent,
      DSidenavbarComponent,
      NgxChartsModule,
    ],
  templateUrl: './d-home.component.html',
  styleUrl: './d-home.component.css'
})
export class DHomeComponent implements OnInit {
  view: [number, number] = [700, 400];
  colorScheme = {
    domain: ['#FF5733', '#33FF57', '#3357FF'], 
  };
  pieChartData: any[] = [];
  showLegend = true;
  showLabels = true;
  isDoughnut = false;
  doctorId: number | null = null;
  todayDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  showNoDataMessage: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const user: LoginResponse | null = this.userService.getUser();

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

    if (!this.doctorId) {
      const storedDoctorId = localStorage.getItem('doctorId');
      if (storedDoctorId) {
        this.doctorId = Number(storedDoctorId);
        console.log('Loaded doctor ID from storage:', this.doctorId);
      }
    }

    if (this.doctorId) {
      console.log('Doctor ID:', this.doctorId);
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
        next: (response: any) => {
          console.log('API Response:', response);

          // Check if all counts are zero
          if (response.data.upcominAppointmentsCount === 0 && 
              response.data.cancelledAppointmentsCount === 0 && 
              response.data.completedAppointmentsCount === 0) {
            this.showNoDataMessage = true;
            this.pieChartData = [];
          } else {
            this.showNoDataMessage = false;
            this.pieChartData = [
              { name: 'Upcoming', value: response.data.upcominAppointmentsCount },
              { name: 'Cancelled', value: response.data.cancelledAppointmentsCount },
              { name: 'Completed', value: response.data.completedAppointmentsCount },
            ];
          }

          console.log('Transformed Chart Data:', this.pieChartData);
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