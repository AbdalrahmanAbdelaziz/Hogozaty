import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-my-appointment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SHeaderComponent,
    SideNavbarComponent,
    NgbDatepickerModule
  ],
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.css']
})
export class MyAppointmentComponent implements OnInit {

  appointments: any[] = [];
  selectedDate!: NgbDateStruct;
  message: string = '';  
  today = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  maxDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: 28 };



  constructor(private http: HttpClient, private router: Router, private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.selectedDate = this.today;  
    this.loadAppointments();
  }



 loadAppointments(): void {
    const formattedDate = `${this.selectedDate.year}-${this.selectedDate.month}-${this.selectedDate.day}`;

    this.appointmentService.getAppointmentsByDate(formattedDate).subscribe(
      (data) => {
        if (data.length > 0) {
          this.appointments = data;
          this.message = '';
        } else {
          this.appointments = [];
          this.message = 'No appointments available on this date.';
        }
      },
      (error) => {
        console.error('Error loading appointments:', error);
        this.appointments = [];
        this.message = 'Error fetching appointments. Please try again later.';
      }
    );
  }

 

  onDateSelect(date: NgbDateStruct): void {
    this.selectedDate = date;
    this.loadAppointments();
  }


  onCancelAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe(() => this.loadAppointments());
    }
  }

  onRescheduleAppointment(appointmentId: number): void {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');  
    if (newDate) {
      this.appointmentService.rescheduleAppointment(appointmentId, newDate).subscribe(() => {
        this.loadAppointments();
      });
    }
  }
  

  onArrived(appointmentId: number): void {
    this.appointmentService.markArrived(appointmentId).subscribe(() => this.loadAppointments());
  }

  onCheckIn(appointmentId: number): void {
    this.appointmentService.markCheckIn(appointmentId).subscribe(() => this.loadAppointments());
  }

  onMarkAsDone(appointmentId: number): void {
    this.appointmentService.markDone(appointmentId).subscribe(() => this.loadAppointments());
  }

  
}
