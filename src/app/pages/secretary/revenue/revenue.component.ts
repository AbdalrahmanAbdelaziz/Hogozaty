import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SHeaderComponent, SSidenavbarComponent],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css'],
})
export class RevenueComponent implements OnInit {
  availableDays: { date: string; dayOfWeek: string }[] = [];
  selectedDate: string = '';
  appointments: Appointment[] = [];
  doctorId!: number;
  userRole: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    if (user && user.data.applicationRole_En === 'Secretary' && user.data.doctorId) {
      this.doctorId = user.data.doctorId;
      this.userRole = user.data.applicationRole_En;
      this.fetchAvailableDays();
    } else {
      this.toastr.error('No doctor ID found for the secretary.', 'Error');
    }
  }

  fetchAvailableDays(): void {
    const numberOfRequiredDays = 30;

    this.appointmentService.getAllDays(this.doctorId, numberOfRequiredDays).subscribe({
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
    this.appointmentService.searchAppointmentsByOptionalParams(this.doctorId).subscribe({
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