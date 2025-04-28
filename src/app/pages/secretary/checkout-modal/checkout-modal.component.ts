import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css']
})
export class CheckoutModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() appointmentId!: number;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    public translocoService: TranslocoService
  ) {}

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

  paymentMethods: { name: string, icon: string, displayName: string }[] = [];

  ngOnInit(): void {
    // Translate payment methods after initialization of translocoService
    this.paymentMethods = [
      { name: 'paidCash', icon: 'fa-solid fa-money-bill-wave', displayName: '' },
      { name: 'paidInstapay', icon: 'fa-solid fa-mobile-screen-button', displayName: '' },
      { name: 'paidWallet', icon: 'fa-solid fa-wallet', displayName: '' },
      { name: 'paidVisa', icon: 'fa-brands fa-cc-visa', displayName: '' }
    ];

    this.paymentMethods.forEach(method => {
      method.displayName = this.translocoService.translate(`paymentMethods.${method.name.replace('paid', '').toLowerCase()}`);
    });

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
        this.toastr.error(this.translocoService.translate('errors.fetchAppointmentError'), this.translocoService.translate('errors.error'));
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
      this.toastr.error(
        this.translocoService.translate('validation.selectPaymentMethod'),
        this.translocoService.translate('errors.error')
      );
      return;
    }

    if (this.paidAmount <= 0) {
      this.toastr.error(
        this.translocoService.translate('validation.enterValidAmount'),
        this.translocoService.translate('errors.error')
      );
      return;
    }

    if (this.paidAmount > (this.appointmentData?.remainingToPay || 0)) {
      this.toastr.error(
        this.translocoService.translate('validation.amountExceedsRemaining'),
        this.translocoService.translate('errors.error')
      );
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
        this.toastr.success(
          this.translocoService.translate('success.paymentSuccess'),
          // this.translocoService.translate('success.success')
        );
        this.isLoading = false;
        this.generatePaymentReceipt(paymentData);
        this.onClose();
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.toastr.error(
          this.translocoService.translate('errors.paymentError'),
          // this.translocoService.translate('errors.error')
        );
        this.isLoading = false;
      }
    });
  }

  async generatePaymentReceipt(paymentData: any): Promise<void> {
    this.isGeneratingPDF = true;
    
    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.left = '-1000px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '600px';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      
      const content = this.receiptContent.nativeElement.cloneNode(true) as HTMLElement;
      const buttons = content.querySelectorAll('button');
      buttons.forEach(btn => btn.remove());
      
      // Get translated payment method name
      const paymentMethodKey = this.paymentMethods.find(m => m.name === this.paymentMethod)?.name.replace('paid', '').toLowerCase() || '';
      const paymentMethodName = this.translocoService.translate(`paymentMethods.${paymentMethodKey}`);
      
      // Add payment details section with translated labels
      const paymentDetailsHTML = `
        <div class="payment-details-section">
          <h4 class="section-title">${this.translocoService.translate('receipt.paymentDetails')}</h4>
          <div class="payment-info-grid">
            <div class="payment-info-item">
              <span class="label">${this.translocoService.translate('receipt.method')}:</span>
              <span class="value">${paymentMethodName}</span>
            </div>
            <div class="payment-info-item">
              <span class="label">${this.translocoService.translate('receipt.amount')}:</span>
              <span class="value">${this.paidAmount.toFixed(2)} ${this.translocoService.translate('general.currency')}</span>
            </div>
            <div class="payment-info-item">
              <span class="label">${this.translocoService.translate('receipt.date')}:</span>
              <span class="value">${new Date().toLocaleString(this.translocoService.getActiveLang())}</span>
            </div>
          </div>
        </div>
      `;
      
      const footer = content.querySelector('.receipt-footer');
      if (footer) {
        footer.insertAdjacentHTML('beforebegin', paymentDetailsHTML);
        
        // Update footer with translated text
        const thankYou = footer.querySelector('p');
        if (thankYou) {
          thankYou.textContent = this.translocoService.translate('receipt.thankYou');
        }
      }
      
      pdfContainer.appendChild(content);
      document.body.appendChild(pdfContainer);
      
      const doc = new jsPDF('p', 'pt', 'a4');
      const options = {
        scale: 1,
        useCORS: true,
        windowWidth: 600,
        width: 600,
        logging: true,
        removeContainer: true
      };
      
      const canvas = await html2canvas(pdfContainer, options);
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      
      // Save with translated filename
      const filename = this.translocoService.translate('receipt.filename', {
        id: this.appointmentId,
        date: new Date().toISOString().slice(0,10)
      });
      doc.save(filename);
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      this.toastr.error(
        this.translocoService.translate('errors.pdfGenerationError'),
        this.translocoService.translate('errors.error')
      );
    } finally {
      const container = document.querySelector('#pdf-container');
      if (container) {
        document.body.removeChild(container);
      }
      this.isGeneratingPDF = false;
    }
  }

  onClose(): void {
    this.closed.emit();
  }
}
