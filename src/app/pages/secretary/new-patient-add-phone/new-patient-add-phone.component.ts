import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-patient-add-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, SHeaderComponent, SideNavbarComponent],
  templateUrl: './new-patient-add-phone.component.html',
  styleUrl: './new-patient-add-phone.component.css'
})
export class NewPatientAddPhoneComponent implements OnInit {
  name: string = '';
  phoneNumber: string = '';
  availableDays: string[] = [];
  selectedDay: string = '';
  timeSlots: any[] = [];
  selectedTimeSlot: string = '';
  docId!: number;

  constructor(private appointmentService: AppointmentService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    if (this.docId) {
      this.loadAvailableDays();
    }
  };

  loadAvailableDays(): void {
    const numberOfRequiredDays = 14;

    this.appointmentService.getAvailableDays(this.docId, numberOfRequiredDays).subscribe(
      (response) => {
        this.availableDays = response.data.workingDays || [];
      },
      (error) => {
        console.error('Error loading available days:', error);
        this.toastr.error('Failed to load available days.', 'Error');
      }
    );
  }

  onDaySelected(): void {
    if (this.selectedDay) {
      this.appointmentService.getTimeSlotsByDate(this.selectedDay, this.docId).subscribe(
        (response) => {
          this.timeSlots = response.data || [];
        },
        (error) => {
          console.error('Error loading time slots:', error);
          this.toastr.error('Failed to load time slots.', 'Error');
        }
      );
    }
  }

  submitAppointment(): void {
    if (!this.name || !this.phoneNumber || !this.selectedDay || !this.selectedTimeSlot) {
      this.toastr.warning('Please fill all fields.');
      return;
    }

    const appointmentData = {
      name: this.name,
      phoneNumber: this.phoneNumber,
      date: this.selectedDay,
      timeSlotId: this.selectedTimeSlot
    };

    this.appointmentService.reserveAppointment(appointmentData).subscribe(
      (response) => {
        this.toastr.success('Appointment booked successfully!');
        
      },
      (error) => {
        this.toastr.error('Failed to book appointment. Try again.');
      }
    );
  }
}
