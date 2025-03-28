import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service'; // Import UserService
import { ServiceOfDoctor } from '../../../services/doctorService.service';
import { DHeaderComponent } from '../d-header/d-header.component';
import { DSidenavbarComponent } from '../d-sidenavbar/d-sidenavbar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-d-service-settings',
  imports: [
    CommonModule,
    RouterModule,
    DHeaderComponent,
    DSidenavbarComponent,
    FormsModule
  ],
  templateUrl: './d-service-settings.component.html',
  styleUrl: './d-service-settings.component.css'
})
export class DServiceSettingsComponent implements OnInit {
  doctorServices: any[] = [];
  availableServices: any[] = [];
  isModalOpen: boolean = false;

  constructor(
    private serivicesOfDoctor: ServiceOfDoctor,
    private doctorService: DoctorService, 
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDoctorServices();
  }

  loadDoctorServices() {
    const user = this.userService.getUser();
    if (user && user.data.doctorId) {
      this.serivicesOfDoctor.getServicesByDoctorId(user.data.doctorId).subscribe((response) => {
        this.doctorServices = response.data;
      });
    }
  }

  openServiceModal() {
    const user = this.userService.getUser();
    console.log('User Object:', user); // Debugging: Log the entire user object
  
    if (!user) {
      console.error('User is not logged in.');
      this.toastr.error('You must be logged in to add services.', 'Error');
      return;
    }
  
    if (!user.data.specializationId) {
      console.error('Specialization ID is missing in user data.');
      this.toastr.error('Your account is missing specialization information. Please contact support.', 'Error');
      return;
    }
  
    this.serivicesOfDoctor.getServicesBySpecializationId(user.data.specializationId).subscribe(
      (response) => {
        this.availableServices = response.data.map((service: any) => ({
          ...service,
          price: null,
          doctorAvgDurationForServiceInMinutes: null
        }));
        this.isModalOpen = true;
      },
      (error) => {
        console.error('Error fetching available services:', error);
        this.toastr.error('Failed to fetch available services.', 'Error');
      }
    );
  }

  closeServiceModal() {
    this.isModalOpen = false;
  }

  validateAndAddService(service: any) {
    if (!service.price || !service.doctorAvgDurationForServiceInMinutes) {
      this.toastr.warning('Please fill all fields.', 'Warning');
      return;
    }
    this.addService(service);
  }

  addService(service: any) {
    const user = this.userService.getUser();
    if (!user || !user.data.doctorId || !user.data.specializationId) {
      console.error('Doctor ID or Specialization ID is missing in user data.');
      this.toastr.error('Doctor ID or Specialization ID is missing.', 'Error');
      return;
    }

    const requestBody = {
      doctorPriceForService: service.price || 0,
      doctorAvgDurationForServiceInMinutes: service.doctorAvgDurationForServiceInMinutes || 0,
      specializationServiceId: service.id,
      doctorId: user.data.doctorId,
      specializationId: user.data.specializationId // Add specializationId to the request body
    };

    this.serivicesOfDoctor.assignServiceToDoctor(requestBody).subscribe(
      (response) => {
        if (response.message === 'This service is already assigned to you.') {
          this.toastr.warning(response.message, 'Warning');
        } else {
          this.toastr.success('Service added successfully.', 'Success');
          this.loadDoctorServices();
          this.closeServiceModal();
        }
      },
      (error) => {
        console.error('Error assigning service to doctor:', error);
        this.toastr.info('This service is already assigned to you.', 'Info');
      }
    );
  }
}

