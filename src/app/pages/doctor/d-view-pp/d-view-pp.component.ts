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
  totalDiscount: number = 0;

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
        this.router.navigate(['/doctor-home']);
      }
    });
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
        // this.toastr.error('Failed to load medical history');
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

  validateDiscount(service: any): void {
    // Ensure discount is between 0-100
    if (service.discountPercentage > 100) {
      service.discountPercentage = 100;
    } else if (service.discountPercentage < 0) {
      service.discountPercentage = 0;
    }
    service.discountApplied = service.discountPercentage > 0;
    
    // Ensure originalPrice is set
    if (!service.originalPrice) {
      service.originalPrice = service.price;
    }
    
    // Update the price with discount applied
    if (service.discountApplied) {
      const discountAmount = service.originalPrice * (service.discountPercentage / 100);
      service.price = service.originalPrice - discountAmount;
    } else {
      service.price = service.originalPrice;
    }
  }



  addService(service: any): void {
    if (this.selectedServices.some(s => s.id === service.id)) {
      this.toastr.warning('Service already added');
      return;
    }
  
    // Round the price to nearest integer
    const roundedPrice = Math.round(service.price);
    
    // Create a copy of the service with the discounted price
    const serviceToAdd = {
      ...service,
      singleServicePriceForAppointment: roundedPrice
    };
  
    this.appointmentService.addServiceToAppointment(
      service.id, 
      this.appointmentId, 
      roundedPrice // Send the rounded price
    ).subscribe({
      next: (response) => {
        this.selectedServices.push(serviceToAdd);
        this.calculateTotal();
        this.toastr.success('Service added successfully');
        // Reset discount for the service in the available services list
        const originalService = this.doctorServices.find(s => s.id === service.id);
        if (originalService) {
          originalService.discountPercentage = 0;
          originalService.discountApplied = false;
          originalService.price = originalService.originalPrice;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to add service', 'Error');
        console.error('Error adding service:', err);
      }
    });
  }


  // removeService(serviceId: number): void {
  //   this.appointmentService.removeServiceFromAppointment(serviceId, this.appointmentId)
  //     .subscribe({
  //       next: () => {
  //         this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
  //         this.calculateTotal();
  //         this.toastr.info('Service removed');
  //       },
  //       error: (err) => {
  //         this.toastr.error('Failed to remove service');
  //       }
  //     });
  // }

  calculateTotal(): void {
    this.totalAmount = this.selectedServices.reduce((total, service) => {
      return total + (service.singleServicePriceForAppointment || service.price || 0);
    }, 0);
  }


  completeVisit(): void {
    this.toastr.success('Patient processed successfully', '', {
    });
    this.router.navigate(['/doctor-home']);
  }
  
  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices.some(service => service.id === serviceId);
  }
  }





