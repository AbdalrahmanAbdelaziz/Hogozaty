import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Appointment } from '../../../shared/models/appointment.model';
import { DHeaderComponent } from '../d-header/d-header.component';
import { DSidenavbarComponent } from '../d-sidenavbar/d-sidenavbar.component';

@Component({
  selector: 'app-d-revenue',
  imports: [CommonModule, RouterModule, FormsModule, DHeaderComponent, DSidenavbarComponent],
  templateUrl: './d-revenue.component.html',
  styleUrl: './d-revenue.component.css'
})
export class DRevenueComponent implements OnInit {
  availableDays: { date: string; dayOfWeek: string }[] = [];
  selectedDate: string = '';
  appointments: Appointment[] = [];
  userId!: number;
  userRole: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    if (user && user.data.applicationRole_En === 'Doctor' && user.data.id) {
      this.userId = user.data.id;
      this.userRole = user.data.applicationRole_En;
      this.fetchAvailableDays();
    } else {
      this.toastr.error('No user ID found for the doctor.', 'Error');
    }
  }

  fetchAvailableDays(): void {
    const numberOfRequiredDays = 30;

    this.appointmentService.getAllDays(this.userId, numberOfRequiredDays).subscribe({
      next: (response: any) => {
        this.availableDays = (response.data.workingDays || []).map((date: string) => {
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
          return { date, dayOfWeek };
        });

        if (this.availableDays.length > 0) {
          this.selectedDate = this.availableDays[0].date;
          this.fetchAppointmentsForDate(this.selectedDate);
        }
      },
      error: (error) => {
        this.toastr.error('Failed to fetch available days', 'Error');
      },
    });
  }

  fetchAppointmentsForDate(date: string): void {
    this.appointmentService.searchAppointmentsByOptionalParams(this.userId).subscribe({
      next: (response: any) => {
        this.appointments = (response.data || []).filter((appointment: Appointment) => {
          return appointment.timeSlot?.date === date; // Filter by timeSlot.date
        });
      },
      error: (error) => {
        this.toastr.error('Failed to fetch appointments', 'Error');
      },
    });
  }

  onDateSelect(event: any): void {
    this.selectedDate = event.target.value;
    this.fetchAppointmentsForDate(this.selectedDate);
  }
}