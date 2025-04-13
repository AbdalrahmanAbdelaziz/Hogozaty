import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { ConfirmationModalComponent } from '../../../confirmation-modal/confirmation-modal.component';
import { CheckoutModalComponent } from '../checkout-modal/checkout-modal.component';
import { Observable, interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-my-appointment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SHeaderComponent,
    SSidenavbarComponent,
    ConfirmationModalComponent,
    CheckoutModalComponent,
  ],
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.css'],
})
export class MyAppointmentComponent implements OnInit, OnDestroy {
  availableDays: { date: string; dayOfWeek: string }[] = [];
  selectedDate: string = '';
  appointments: any[] = [];
  doctorId!: number;
  isCancelModalOpen: boolean = false;
  isCheckoutModalVisible: boolean = false;
  appointmentToCancel: any = null;
  appointmentToCheckout: any = null;
  selectedAppointmentId: number | null = null;
  private pollingSubscription!: Subscription;

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    if (user && user.data.applicationRole_En === 'Secretary' && user.data.doctorId) {
      this.doctorId = user.data.doctorId;
      this.fetchAvailableDays();
      this.startPolling();
    } else {
      this.toastr.error('No doctor ID found for the secretary.', 'Error');
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  startPolling(): void {
    this.pollingSubscription = interval(5000)
      .pipe(
        switchMap(() => this.appointmentService.searchAppointmentsByOptionalParams(this.doctorId))
      )
      .subscribe({
        next: (response: any) => {
          this.appointments = (response.data || []).filter((appointment: any) => {
            return (
              appointment.timeSlot?.date === this.selectedDate &&
              appointment.appointmentStatus_En !== 'Cancelled' &&
              appointment.appointmentStatus_En !== 'Proccessed'
            );
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastr.error('Failed to fetch appointments', 'Error');
        },
      });
  }

  fetchAvailableDays(): void {
    const numberOfRequiredDays = 14;

    this.appointmentService.getAvailableDays(this.doctorId, numberOfRequiredDays).subscribe({
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
        this.appointments = (response.data || []).filter((appointment: any) => {
          return (
            appointment.timeSlot?.date === date &&
            appointment.appointmentStatus_En !== 'Cancelled' &&
            appointment.appointmentStatus_En !== 'Proccessed'
          );
        });
        this.cdr.detectChanges();
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

  markAsArrived(appointmentId: number): void {
    this.makeAppointmentArrived(appointmentId).subscribe({
      next: () => {
        this.toastr.success('Appointment status updated to Arrived');
        this.fetchAppointmentsForDate(this.selectedDate);
      },
      error: (err) => {
        this.toastr.error('Failed to update appointment status');
      },
    });
  }

  markAsNextInQueue(appointmentId: number): void {
    this.makeAppointmentNextInQueue(appointmentId).subscribe({
      next: () => {
        this.toastr.success('Appointment status updated to Next in Queue');
        this.fetchAppointmentsForDate(this.selectedDate);
      },
      error: (err) => {
        this.toastr.error('Failed to update appointment status');
      },
    });
  }

  markAsInProgress(appointmentId: number): void {
    // Disabled for secretary
  }

  markAsProcessed(appointmentId: number): void {
    this.makeAppointmentProcessed(appointmentId).subscribe({
      next: () => {
        this.toastr.success('Appointment status updated to Processed');
        
        // Find and update the appointment in the current list
        const processedAppointment = this.appointments.find(appt => appt.id === appointmentId);
        if (processedAppointment) {
          // Set the processed status
          processedAppointment.appointmentStatus_En = 'Processed';
          
          // Fetch the updated appointment data before opening the modal
          this.appointmentService.getAppointmentById(appointmentId).subscribe({
            next: (response) => {
              this.appointmentToCheckout = response.data;
              this.isCheckoutModalVisible = true;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.toastr.error('Failed to fetch updated appointment data');
            }
          });
        }
        
        // Refresh the appointments list
        this.fetchAppointmentsForDate(this.selectedDate);
      },
      error: (err) => {
        this.toastr.error('Failed to update appointment status');
      },
    });
  }

  reschedule(appointmentId: number, doctorId: number): void {
    this.router.navigate([`/sec-doctor-appointments-reschedual/${doctorId}/-1/-1`], {
      queryParams: { isReschedule: true, appointmentId: appointmentId },
    });
  }

  openCancelModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.selectedAppointmentId = null;
  }

  confirmCancel(): void {
    if (this.selectedAppointmentId) {
      this.appointmentService.cancelAppointment(this.selectedAppointmentId).subscribe({
        next: () => {
          this.toastr.success('Appointment cancelled successfully!');
          this.appointments = this.appointments.filter((appt) => appt.id !== this.selectedAppointmentId);
          this.closeCancelModal();
        },
        error: (err) => {
          this.toastr.error('Failed to cancel appointment. Please try again.');
          this.closeCancelModal();
        },
      });
    }
  }



  closeCheckoutModal(): void {
    this.isCheckoutModalVisible = false;
    this.appointmentToCheckout = null;
    this.fetchAppointmentsForDate(this.selectedDate);
  }

  getRemainingToPay(appointment: Appointment): number {
      return appointment.remainingToPay ?? 0;
    }
  
    // Check if there's remaining payment
    hasRemainingPayment(appointment: Appointment): boolean {
      return (appointment.remainingToPay ?? 0) > 0;
    }
  
    openCheckoutModal(appointment: Appointment): void {
      if (appointment.id) {
        this.selectedAppointmentId = appointment.id;
        this.isCheckoutModalVisible = true;
      } else {
        this.toastr.error('Invalid appointment selected', 'Error');
      }
    }

  getAppointmentReceipt(appointmentId: number): void {
    this.appointmentService.getAppointmentReceipt(appointmentId).subscribe({
      next: (response: any) => {
        this.toastr.success('Receipt fetched successfully');
      },
      error: (error) => {
        this.toastr.error('Failed to fetch receipt');
      },
    });
  }

  makeAppointmentArrived(appointmentId: number): Observable<any> {
    return this.appointmentService.makeAppointmentArrived(appointmentId);
  }

  makeAppointmentNextInQueue(appointmentId: number): Observable<any> {
    return this.appointmentService.makeAppointmentNextInQueue(appointmentId);
  }

  makeAppointmentInProgress(appointmentId: number): Observable<any> {
    return this.appointmentService.makeAppointmentInProgress(appointmentId);
  }

  makeAppointmentProcessed(appointmentId: number): Observable<any> {
    return this.appointmentService.makeAppointmentProcessed(appointmentId);
  }
}