import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css'],
})
export class CheckoutModalComponent {
  @Input() isVisible: boolean = false;
  @Input() appointmentId!: number;
  @Output() closed = new EventEmitter<void>();

  services: any[] = [];
  totalPrice: number = 0;
  paymentMethod: string | null = null; // No default selection
  paidAmount: number = 0;
  remainingAmount: number = 0;

  paymentMethods = [
    { name: 'cash', icon: 'fa-solid fa-money-bill-wave' },
    { name: 'visa', icon: 'fa-brands fa-cc-visa' },
    { name: 'wallet', icon: 'fa-solid fa-wallet' },
    { name: 'instapay', icon: 'fa-solid fa-mobile-alt' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      this.fetchAppointmentServices();
    }
  }

  fetchAppointmentServices(): void {
    this.appointmentService.getAppointmentServices(this.appointmentId).subscribe({
      next: (response: any) => {
        this.services = response.data.services || [];
        this.totalPrice = response.data.totalPrice || 0;
        this.calculateRemainingAmount();
      },
      error: () => {
        this.toastr.error('Failed to fetch appointment services', 'Error');
      },
    });
  }

  calculateRemainingAmount(): void {
    this.remainingAmount = this.totalPrice - this.paidAmount;
  }

  onPaymentMethodChange(method: string): void {
    this.paymentMethod = method;
  }

  onSubmit(): void {
    if (!this.paymentMethod) {
      this.toastr.error('Please select a payment method', 'Error');
      return;
    }

    const paymentData = {
      appointmentId: this.appointmentId,
      paymentMethod: this.paymentMethod,
      paidAmount: this.paidAmount,
      remainingAmount: this.remainingAmount,
    };

    this.appointmentService.submitPayment(paymentData).subscribe({
      next: () => {
        this.toastr.success('Payment submitted successfully', 'Success');
        this.closed.emit();
      },
      error: () => {
        this.toastr.error('Failed to submit payment', 'Error');
      },
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}