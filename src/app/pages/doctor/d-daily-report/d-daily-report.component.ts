import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DHeaderComponent } from '../d-header/d-header.component';
import { DSidenavbarComponent } from '../d-sidenavbar/d-sidenavbar.component';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-d-daily-report',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DHeaderComponent,
    DSidenavbarComponent,
  ],
  templateUrl: './d-daily-report.component.html',
  styleUrls: ['./d-daily-report.component.css']
})
export class DDailyReportComponent implements OnInit {
  availableDays: { date: string; dayOfWeek: string }[] = [];
  selectedDate: string = '';
  revenueData: any = {
    paidCash: 0,
    paidInstapay: 0,
    paidWallet: 0,
    paidVisa: 0,
    totalPrice: 0,
    remainingToPay: 0
  };
  userId!: number;
  userRole: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private userService: UserService,
    private toastr: ToastrService,
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
          this.fetchRevenueData(this.selectedDate);
        }
      },
      error: (error) => {
        this.toastr.error('Failed to fetch available days', 'Error');
      },
    });
  }

  fetchRevenueData(date: string): void {
    this.doctorService.getDoctorDayFinalRevenue(this.userId, date).subscribe({
      next: (response: any) => {
        this.revenueData = {
          paidCash: response.data?.paidCash || 0,
          paidInstapay: response.data?.paidInstapay || 0,
          paidWallet: response.data?.paidWallet || 0,
          paidVisa: response.data?.paidVisa || 0,
          totalPrice: response.data?.totalPrice || 0,
          remainingToPay: response.data?.remainingToPay || 0
        };
      },
      error: (error) => {
        this.toastr.error('Failed to fetch revenue data', 'Error');
        this.revenueData = {
          paidCash: 0,
          paidInstapay: 0,
          paidWallet: 0,
          paidVisa: 0,
          totalPrice: 0,
          remainingToPay: 0
        };
      },
    });
  }

  onDateSelect(event: any): void {
    this.selectedDate = event.target.value;
    this.fetchRevenueData(this.selectedDate);
  }

  calculateTotalPaid(): number {
    return (this.revenueData.paidCash || 0) + 
           (this.revenueData.paidInstapay || 0) + 
           (this.revenueData.paidWallet || 0) +
           (this.revenueData.paidVisa || 0);
  }
}