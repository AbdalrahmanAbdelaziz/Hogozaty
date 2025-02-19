import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SHeaderComponent } from '../s-header/s-header.component';
import { RouterModule } from '@angular/router';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { DoctorService } from '../../../services/doctor.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-setting',
   imports: [
      CommonModule,
      RouterModule,
      SHeaderComponent,
      SideNavbarComponent,
      FormsModule
    ],
  templateUrl: './service-setting.component.html',
  styleUrl: './service-setting.component.css'
})
export class ServiceSettingComponent implements OnInit {
  doctorServices: any[] = [];
  availableServices: any[] = [];
  selectedServices: any[] = [];
  isModalOpen: boolean = false;

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctorServices();
    this.loadAvailableServices();
  }

  loadDoctorServices() {
    this.doctorService.getDoctorServices().subscribe((data) => {
      this.doctorServices = data;
    });
  }

  loadAvailableServices() {
    this.doctorService.getAvailableServices().subscribe((data) => {
      this.availableServices = data;
    });
  }

  openServiceModal() {
    this.isModalOpen = true;
  }

  closeServiceModal() {
    this.isModalOpen = false;
    this.selectedServices = [];
  }

  toggleServiceSelection(service: any) {
    const index = this.selectedServices.indexOf(service);
    if (index === -1) {
      this.selectedServices.push(service);
    } else {
      this.selectedServices.splice(index, 1);
    }
  }

  saveSelectedServices() {
    const newServices = this.selectedServices.map(service => ({
      serviceId: service.id,
      price: service.price
    }));

    this.doctorService.addDoctorServices(newServices).subscribe(() => {
      this.loadDoctorServices();
      this.closeServiceModal();
    });
  }
}
