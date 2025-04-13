import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout-remaining',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-remaining.component.html',
  styleUrl: './checkout-remaining.component.css'
})
export class CheckoutRemainingComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() appointmentId!: number;
  @Output() closed = new EventEmitter<void>();

  receiptServices: any[] = [];
  totalPrice: number = 0;
  paymentMethod: string | null = null;
  paidAmount: number = 0;
  remainingAmount: number = 0;
  isLoading: boolean = false;

  paymentMethods = [
    { name: 'paidCash', icon: 'fa-solid fa-money-bill-wave', displayName: 'Cash' },
    { name: 'paidInstapay', icon: 'custom-icon-instapay', displayName: 'Instapay' },
    { name: 'paidWallet', icon: 'fa-solid fa-wallet', displayName: 'Wallet' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    console.log('CheckoutModal initialized with appointmentId:', this.appointmentId);
    if (this.appointmentId) {
      this.fetchAppointmentReceipt();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Input changes detected:', changes);
    if (changes['appointmentId'] && changes['appointmentId'].currentValue) {
      console.log('Appointment ID changed to:', changes['appointmentId'].currentValue);
      this.fetchAppointmentReceipt();
    }
  }

  fetchAppointmentReceipt(): void {
    if (!this.appointmentId) {
      console.error('No appointment ID provided');
      return;
    }

    console.log('Fetching receipt for appointment:', this.appointmentId);
    this.isLoading = true;
    this.appointmentService.getAppointmentReceipt(this.appointmentId).subscribe({
      next: (response: any) => {
        console.log('Receipt response:', response);
        this.receiptServices = response.data || [];
        this.calculateReceiptTotal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching receipt:', error);
        this.toastr.error('Failed to fetch receipt', 'Error');
        this.isLoading = false;
      }
    });
  }

  calculateReceiptTotal(): void {
    this.totalPrice = this.receiptServices.reduce(
      (sum, service) => sum + (service.singleServicePriceForAppointment || 0), 
      0
    );
    this.calculateRemainingAmount();
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

    if (this.paidAmount <= 0) {
      this.toastr.error('Please enter a valid payment amount', 'Error');
      return;
    }

    if (this.paidAmount > this.totalPrice) {
      this.toastr.error('Paid amount cannot exceed total price', 'Error');
      return;
    }

    // Payment data matches the backend requirements
    const paymentData = {
      paidCash: this.paymentMethod === 'paidCash' ? this.paidAmount : 0,
      paidInstapay: this.paymentMethod === 'paidInstapay' ? this.paidAmount : 0,
      paidWallet: this.paymentMethod === 'paidWallet' ? this.paidAmount : 0,
      appointmentId: this.appointmentId
    };

    console.log('Submitting payment:', paymentData);
    this.isLoading = true;
    this.appointmentService.payAppointment(paymentData).subscribe({
      next: () => {
        this.toastr.success('Payment processed successfully', 'Success');
        this.isLoading = false;
        this.closed.emit();
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.toastr.error('Failed to process payment', 'Error');
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
