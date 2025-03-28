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

@Component({
  selector: 'app-d-view-pp',
  standalone: true,
  imports: [CommonModule, FormsModule, DHeaderComponent, DSidenavbarComponent],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private toastr: ToastrService,
    private servicesOfDoctor: ServiceOfDoctor,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.appointmentId = +params['appointmentId'];
      if (this.appointmentId) {
        this.loadAppointmentDetails();
      } else {
        this.toastr.error('No appointment ID provided');
        this.router.navigate(['/doctor/appointments']);
      }
    });
  }

  loadDoctorServices() {
    const user = this.userService.getUser();
    if (user && user.data.doctorId) {
      this.servicesOfDoctor.getServicesByDoctorId(user.data.doctorId).subscribe({
        next: (response) => {
          this.doctorServices = response.data;
        },
        error: (err) => {
          this.toastr.error('Failed to load doctor services');
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
        this.toastr.error('Failed to load appointment details');
      }
    });
  }

  loadPatientDetails(patientId: number): void {
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patientDetails = patient.data;
      },
      error: (err) => {
        this.toastr.error('Failed to load patient details');
      }
    });
  }

  loadMedicalHistory(patientId: number): void {
    this.patientService.getMedicalRecordsByPatient(patientId).subscribe({
      next: (records) => {
        this.medicalHistory = records.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to load medical history');
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
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addService(service: any): void {
    if (this.selectedServices.some(s => s.id === service.id)) {
      this.toastr.warning('Service already added');
      return;
    }
    
    const serviceToAdd = {
      ...service,
      quantity: 1
    };
    
    this.selectedServices.push(serviceToAdd);
    this.calculateTotal();
    this.toastr.success('Service added successfully');
  }

  removeService(serviceId: number): void {
    this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
    this.calculateTotal();
    this.toastr.info('Service removed');
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  }

  updateQuantity(service: any, change: number): void {
    const newQuantity = service.quantity + change;
    if (newQuantity < 1) return;
    
    service.quantity = newQuantity;
    this.calculateTotal();
  }

  saveServices(): void {
    if (this.selectedServices.length === 0) {
      this.toastr.warning('Please add at least one service');
      return;
    }

    const requests = this.selectedServices.map(service => {
      return this.appointmentService.addServiceToAppointment(
        service.id,
        this.appointmentId,
        service.price
      );
    });

    // You might want to use forkJoin here if you need to wait for all requests
    requests.forEach(request => {
      request.subscribe({
        next: () => {
          // Individual service added successfully
        },
        error: (err) => {
          this.toastr.error('Failed to add some services');
        }
      });
    });

    this.toastr.success('Services saved successfully');
  }

  completeVisit(): void {
    this.saveServices();
    this.toastr.success('Patient processed successfully', '', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right'
    });
    this.router.navigate(['/doctor/d-home']);
  }
}