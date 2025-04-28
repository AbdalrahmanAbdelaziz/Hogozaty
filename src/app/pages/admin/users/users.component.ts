import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { DoctorService } from '../../../services/doctor.service';
import { APIResponse } from '../../../shared/models/api-response.dto';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { LoadingSpinnerComponent } from '../../../shared/constants/loading-spinner.component';
import { ToastrService } from 'ngx-toastr';
import { Doctor } from '../../../shared/models/doctor.model';
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, AdminHeaderComponent, LoadingSpinnerComponent, TranslocoModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  searchQuery = '';
  currentLanguage = 'en';

  constructor(
    private doctorService: DoctorService,
    private translocoService: TranslocoService,
    private toastr: ToastrService,
    private router: Router // Add Router to constructor
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.translocoService.getActiveLang();
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    this.doctorService.getAllDoctors().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        if (response.succeeded && response.data) {
          this.doctors = response.data;
          this.filteredDoctors = [...this.doctors];
        } else {
          const message = response.message || 
                        this.translocoService.translate('errors.failed_load_doctors');
          this.errorMessage = message;
          this.toastr.error(message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.errorMessage = this.translocoService.translate('errors.load_doctors_error');
        this.isLoading = false;
      }
    });
  }

  // Add this new method to navigate to doctor details
  navigateToDoctor(doctorId: string): void {
    this.router.navigate(['/each-doctor'], { queryParams: { id: doctorId } });
  }

  calculateRevenue(checkPrice: number): number {
    return checkPrice * 0.1;
  }

  getTotalRevenue(): number {
    return this.filteredDoctors.reduce((total, doctor) => total + this.calculateRevenue(doctor.checkPrice), 0);
  }

  getTranslatedName(item: any, property: string): string {
    return this.currentLanguage === 'ar' ? item[`${property}_Ar`] : item[`${property}_En`];
  }

  filterDoctors(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase();
    
    if (!this.searchQuery) {
      this.filteredDoctors = [...this.doctors];
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor => 
      doctor.firstName.toLowerCase().includes(this.searchQuery) ||
      doctor.lastName.toLowerCase().includes(this.searchQuery) ||
      doctor.email.toLowerCase().includes(this.searchQuery) ||
      doctor.phoneNumber.toLowerCase().includes(this.searchQuery) ||
      this.getTranslatedName(doctor, 'country').toLowerCase().includes(this.searchQuery) ||
      this.getTranslatedName(doctor, 'governorate').toLowerCase().includes(this.searchQuery) ||
      this.getTranslatedName(doctor, 'district').toLowerCase().includes(this.searchQuery)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredDoctors = [...this.doctors];
  }

  refreshDoctors(): void {
    this.clearSearch();
    this.loadDoctors();
  }
}