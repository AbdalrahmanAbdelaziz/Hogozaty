import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { DoctorService } from '../../../services/doctor.service';
import { UserService } from '../../../services/user.service';
import { ServiceOfDoctor } from '../../../services/doctorService.service';

@Component({
  selector: 'app-service-setting',
  imports: [
    CommonModule,
    RouterModule,
    SHeaderComponent,
    SSidenavbarComponent,
    FormsModule
  ],
  templateUrl: './service-setting.component.html',
  styleUrl: './service-setting.component.css'
})
export class ServiceSettingComponent implements OnInit {
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
    if (user && user.data.specializationId) {
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
    } else {
      console.error('Specialization ID is missing in user data.');
      this.toastr.error('Specialization ID is missing.', 'Error');
    }
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
    if (!user || !user.data.doctorId) {
      console.error('Doctor ID is missing in user data.');
      this.toastr.error('Doctor ID is missing.', 'Error');
      return;
    }

    const requestBody = {
      doctorPriceForService: service.price || 0,
      doctorAvgDurationForServiceInMinutes: service.doctorAvgDurationForServiceInMinutes || 0,
      specializationServiceId: service.id,
      doctorId: user.data.doctorId
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