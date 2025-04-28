import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { PatientService } from '../../../services/patient.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DHeaderComponent } from '../d-header/d-header.component';
import { DSidenavbarComponent } from '../d-sidenavbar/d-sidenavbar.component';
import { ServiceOfDoctor } from '../../../services/doctorService.service';
import { UserService } from '../../../services/user.service';
import { forkJoin } from 'rxjs';
import { FileSizePipe } from '../../../services/file-size.pipe';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-d-view-pp',
  standalone: true,
  imports: [CommonModule, FormsModule, DHeaderComponent, DSidenavbarComponent, FileSizePipe, TranslocoModule],
  templateUrl: './d-view-pp.component.html',
  styleUrls: ['./d-view-pp.component.css']
})
export class DViewPpComponent implements OnInit {
  appointmentId!: number;
  appointmentDetails: any;
  patientDetails: any;
  medicalHistory: any[] = [];
  isLoading: boolean = true;
  currentTab: string = 'personal';
  doctorServices: any[] = [];
  selectedServices: any[] = [];
  totalAmount: number = 0;
  totalDiscount: number = 0;
  visitHistory: any[] = [];
  filteredVisitHistory: any[] = [];
  historySearchTerm: string = '';
  historySortBy: string = 'dateDesc';
  expandedVisits: { [key: number]: boolean } = {};
  currentDiagnosis: string = '';
  currentPrescription: string = '';
  uploadedFiles: any[] = [];
  isDragOver: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private toastr: ToastrService,
    private servicesOfDoctor: ServiceOfDoctor,
    private userService: UserService,
    public translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.appointmentId = +params['appointmentId'];
      if (this.appointmentId) {
        this.loadAppointmentDetails();
      } else {
        this.showTranslatedToastr('error', 'no_appointment_id', 'No appointment ID provided');
        this.router.navigate(['/doctor-home']);
      }
    });
  }

  private showTranslatedToastr(type: 'success' | 'error' | 'info' | 'warning', key: string, defaultMessage: string): void {
    const message = this.translocoService.translate(`toastr.${key}`) || defaultMessage;
    const title = this.translocoService.translate(`toastr.${type}`) || 
                 type.charAt(0).toUpperCase() + type.slice(1);
    this.toastr[type](message, title);
  }

  loadDoctorServices() {
    const user = this.userService.getUser();
    if (user && user.data.doctorId) {
      this.servicesOfDoctor.getServicesByDoctorId(user.data.doctorId).subscribe({
        next: (response) => {
          this.doctorServices = response.data.map((service: any) => ({
            ...service,
            price: parseFloat(service.servicePrice),
            discountPercentage: 0,
            discountApplied: false
          }));
        },
        error: (err) => {
          this.showTranslatedToastr('error', 'load_services_error', 'Failed to load doctor services');
        }
      });
    }
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  loadAppointmentDetails(): void {
    this.isLoading = true;
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        this.appointmentDetails = appointment.data;
        this.loadPatientDetails(this.appointmentDetails.patientID);
        this.loadMedicalHistory(this.appointmentDetails.patientID);
      },
      error: (err) => {
        this.isLoading = false;
        this.showTranslatedToastr('error', 'load_appointment_error', 'Failed to load appointment details');
      }
    });
  }

  loadPatientDetails(patientId: number): void {
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patientDetails = patient.data;
      },
      error: (err) => {
        this.showTranslatedToastr('error', 'load_patient_error', 'Failed to load patient details');
      }
    });
  }

  loadMedicalHistory(patientId: number): void {
    this.patientService.getMedicalRecordsByPatient(patientId).subscribe({
      next: (records) => {
        this.medicalHistory = records.data || [];
        this.loadVisitHistory(patientId);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showTranslatedToastr('error', 'load_medical_history_error', 'Failed to load medical history');
      }
    });
  }

  loadVisitHistory(patientId: number): void {
    this.patientService.getVisitHistory(patientId).subscribe({
      next: (response) => {
        this.visitHistory = response.data.map((visit: any) => ({
          ...visit,
          date: visit.date || visit.createdAt,
          services: visit.services || [],
          attachments: visit.attachments || []
        }));
        this.filteredVisitHistory = [...this.visitHistory];
        this.sortHistory();
      },
      error: (err) => {
        this.showTranslatedToastr('error', 'load_visit_history_error', 'Failed to load visit history');
      }
    });
  }

  filterHistory(): void {
    if (!this.historySearchTerm) {
      this.filteredVisitHistory = [...this.visitHistory];
      return;
    }
  
    const term = this.historySearchTerm.toLowerCase();
    this.filteredVisitHistory = this.visitHistory.filter(visit => {
      return (
        (visit.diagnosis && visit.diagnosis.toLowerCase().includes(term)) ||
        (visit.doctorName && visit.doctorName.toLowerCase().includes(term)) ||
        (visit.services && visit.services.some((service: any) => 
          service.name.toLowerCase().includes(term)))
      );
    });
  
    this.sortHistory();
  }

  sortHistory(): void {
    if (this.historySortBy === 'dateDesc') {
      this.filteredVisitHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      this.filteredVisitHistory.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }

  toggleVisitDetails(visitId: number): void {
    this.expandedVisits[visitId] = !this.expandedVisits[visitId];
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        this.showTranslatedToastr('warning', 'file_too_large', `File ${file.name} is too large (max 5MB)`);
        continue;
      }
      
      if (!['image/jpeg', 'image/png', 'application/pdf', 'text/plain'].includes(file.type)) {
        this.showTranslatedToastr('warning', 'unsupported_file_type', `File type not supported: ${file.name}`);
        continue;
      }

      this.uploadedFiles.push({
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  saveDraft(): void {
    this.showTranslatedToastr('info', 'draft_saved', 'Draft saved locally');
  }

  submitVisitDetails(): void {
    if (!this.currentDiagnosis && this.uploadedFiles.length === 0) {
      this.showTranslatedToastr('warning', 'missing_diagnosis', 'Please add at least a diagnosis or upload files');
      return;
    }

    this.isSubmitting = true;
    
    const uploadObservables = this.uploadedFiles.map(file => 
      this.patientService.uploadFile(file.file, this.appointmentId)
    );

    const visitDetails = {
      appointmentId: this.appointmentId,
      diagnosis: this.currentDiagnosis,
      prescription: this.currentPrescription,
      files: this.uploadedFiles.map(f => f.name)
    };

    if (uploadObservables.length > 0) {
      forkJoin(uploadObservables).subscribe({
        next: () => {
          this.submitDiagnosis(visitDetails);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showTranslatedToastr('error', 'upload_error', 'Error uploading files');
        }
      });
    } else {
      this.submitDiagnosis(visitDetails);
    }
  }

  private submitDiagnosis(visitDetails: any): void {
    this.patientService.submitDiagnosis(visitDetails).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showTranslatedToastr('success', 'diagnosis_submitted', 'Visit details submitted successfully');
        this.loadVisitHistory(this.patientDetails.id);
        this.changeTab('history');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showTranslatedToastr('error', 'diagnosis_error', 'Error submitting diagnosis');
      }
    });
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
    if (tab === 'current') {
      this.loadDoctorServices();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return this.translocoService.translate('patient_profile.not_specified');
    
    const date = new Date(dateString);
    return date.toLocaleDateString(this.translocoService.getActiveLang(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  validateDiscount(service: any): void {
    if (service.discountPercentage > 100) {
      service.discountPercentage = 100;
    } else if (service.discountPercentage < 0) {
      service.discountPercentage = 0;
    }
    service.discountApplied = service.discountPercentage > 0;
    
    if (!service.originalPrice) {
      service.originalPrice = service.price;
    }
    
    if (service.discountApplied) {
      const discountAmount = service.originalPrice * (service.discountPercentage / 100);
      service.price = service.originalPrice - discountAmount;
    } else {
      service.price = service.originalPrice;
    }
  }

  addService(service: any): void {
    if (this.selectedServices.some(s => s.id === service.id)) {
      this.showTranslatedToastr('warning', 'service_exists', 'Service already added');
      return;
    }
  
    const roundedPrice = Math.round(service.price);
    const serviceToAdd = {
      ...service,
      singleServicePriceForAppointment: roundedPrice
    };
  
    this.appointmentService.addServiceToAppointment(
      service.id, 
      this.appointmentId, 
      roundedPrice
    ).subscribe({
      next: (response) => {
        this.selectedServices.push(serviceToAdd);
        this.calculateTotal();
        this.showTranslatedToastr('success', 'service_added', 'Service added successfully');
        const originalService = this.doctorServices.find(s => s.id === service.id);
        if (originalService) {
          originalService.discountPercentage = 0;
          originalService.discountApplied = false;
          originalService.price = originalService.originalPrice;
        }
      },
      error: (err) => {
        this.showTranslatedToastr('error', 'add_service_error', 'Failed to add service');
      }
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedServices.reduce((total, service) => {
      return total + (service.singleServicePriceForAppointment || service.price || 0);
    }, 0);
  }

  completeVisit(): void {
    this.showTranslatedToastr('success', 'visit_completed', 'Patient processed successfully');
    this.router.navigate(['/doctor-home']);
  }
  
  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices.some(service => service.id === serviceId);
  }

  get isArabic(): boolean {
    return this.translocoService.getActiveLang() === 'ar';
  }
  
}