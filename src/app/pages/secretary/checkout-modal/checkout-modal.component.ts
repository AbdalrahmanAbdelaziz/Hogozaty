import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css']
})
export class CheckoutModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() appointmentId!: number;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  appointmentData: any = {
    patientName: '',
    doctorName: '',
    timeSlot: { date: '', startTime: '', endTime: '' },
    totalPrice: 0,
    remainingToPay: 0,
    paidCash: 0,
    paidInstapay: 0,
    paidWallet: 0,
    paidVisa: 0,
    checkPrice: 0
  };
  
  receiptServices: any[] = [];
  paymentMethod: string | null = null;
  paidAmount: number = 0;
  isLoading: boolean = false;
  isGeneratingPDF: boolean = false;

  paymentMethods = [
    { name: 'paidCash', icon: 'fa-solid fa-money-bill-wave', displayName: 'Cash' },
    { name: 'paidInstapay', icon: 'custom-icon-instapay', displayName: 'Instapay' },
    { name: 'paidWallet', icon: 'fa-solid fa-wallet', displayName: 'Wallet' },
    { name: 'paidVisa', icon: 'fa-brands fa-cc-visa', displayName: 'Visa' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      this.fetchAppointmentData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isVisible']?.currentValue === true && changes['isVisible']?.previousValue === false) ||
        changes['appointmentId']?.currentValue) {
      if (this.appointmentId) {
        this.fetchAppointmentData();
      }
    }
  }

  fetchAppointmentData(): void {
    if (!this.appointmentId) {
      console.error('No appointment ID provided');
      return;
    }

    this.isLoading = true;

    forkJoin([
      this.appointmentService.getAppointmentById(this.appointmentId),
      this.appointmentService.getAppointmentReceipt(this.appointmentId)
    ]).subscribe({
      next: ([appointmentResponse, receiptResponse]) => {
        // Calculate check price
        const servicesTotal = (receiptResponse.data?.appointmentServicesResponses || [])
          .reduce((sum: number, service: any) => sum + (service.singleServicePriceForAppointment || 0), 0);
        const totalPrice = receiptResponse.data?.totalPrice || 0;
        const checkPrice = totalPrice - servicesTotal;

        this.appointmentData = {
          patientName: appointmentResponse.data?.patientName || 'N/A',
          doctorName: appointmentResponse.data?.doctorName || 'N/A',
          timeSlot: appointmentResponse.data?.timeSlot || { date: '', startTime: '', endTime: '' },
          totalPrice: totalPrice,
          remainingToPay: receiptResponse.data?.remainingToPay || 0,
          paidCash: receiptResponse.data?.paidCash || 0,
          paidInstapay: receiptResponse.data?.paidInstapay || 0,
          paidWallet: receiptResponse.data?.paidWallet || 0,
          paidVisa: receiptResponse.data?.paidVisa || 0,
          checkPrice: checkPrice
        };
        
        this.receiptServices = receiptResponse.data?.appointmentServicesResponses || [];
        this.paidAmount = this.calculateTotalPaid();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.toastr.error('Failed to fetch appointment data', 'Error');
        this.isLoading = false;
      }
    });
  }

  calculateTotalPaid(): number {
    return (this.appointmentData.paidCash || 0) + 
           (this.appointmentData.paidInstapay || 0) + 
           (this.appointmentData.paidWallet || 0) +
           (this.appointmentData.paidVisa || 0);
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

    if (this.paidAmount > (this.appointmentData?.remainingToPay || 0)) {
      this.toastr.error('Paid amount cannot exceed remaining amount', 'Error');
      return;
    }

    const paymentData = {
      paidCash: this.paymentMethod === 'paidCash' ? this.paidAmount : 0,
      paidInstapay: this.paymentMethod === 'paidInstapay' ? this.paidAmount : 0,
      paidWallet: this.paymentMethod === 'paidWallet' ? this.paidAmount : 0,
      paidVisa: this.paymentMethod === 'paidVisa' ? this.paidAmount : 0,
      appointmentId: this.appointmentId
    };

    this.isLoading = true;
    this.appointmentService.payAppointment(paymentData).subscribe({
      next: () => {
        this.toastr.success('Payment processed successfully', 'Success');
        this.isLoading = false;
        this.onClose();
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.toastr.error('Failed to process payment', 'Error');
        this.isLoading = false;
      }
    });
  }

  generatePDF(): void {
    if (!this.appointmentData) return;

    this.isGeneratingPDF = true;
    const content = this.receiptContent.nativeElement;
    const doc = new jsPDF('p', 'mm', 'a4');
    const options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
    };

    const buttons: NodeListOf<HTMLButtonElement> = content.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => button.style.display = 'none');

    html2canvas(content, options).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = doc.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      doc.save(`receipt_${this.appointmentData.patientName}_${this.appointmentData.timeSlot.date}.pdf`);
      
      buttons.forEach((button: HTMLButtonElement) => button.style.display = '');
      this.isGeneratingPDF = false;
    }).catch((error: Error) => {
      console.error('Error generating PDF:', error);
      this.toastr.error('Failed to generate PDF', 'Error');
      buttons.forEach((button: HTMLButtonElement) => button.style.display = '');
      this.isGeneratingPDF = false;
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}