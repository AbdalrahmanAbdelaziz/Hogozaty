import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PHeaderComponent } from '../p-header/p-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { Clinic } from '../../../shared/models/clinic.model';
import { UserService } from '../../../services/user.service';
import { SpecializationService } from '../../../services/specialization.service';
import { ClinicService } from '../../../services/clinic.service';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { forkJoin, map } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-filtered-doctors',
   imports: [CommonModule, RouterModule, PHeaderComponent, ReactiveFormsModule, FormsModule, SideNavbarComponent],
  templateUrl: './filtered-doctors.component.html',
  styleUrl: './filtered-doctors.component.css'
})
export class FilteredDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  patient!: LoginResponse;
  specialization: string = '';
  filteredDoctors: Doctor[] = [];
  searchTerm: string = '';
  specializationNames: { [key: number]: string } = {}; // Store specialization names
  clinics: { [id: number]: Clinic } = {}; // Store clinics by ID
  specializationId!: number;


  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private clinicService: ClinicService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });

    this.activatedRoute.params.subscribe(params => {
      if (params['specialization']) {
        const specializationId = Number(params['specialization']); // Convert string to number
        if (!isNaN(specializationId)) {
          this.getSpecializationName(specializationId);
          this.fetchDoctors(specializationId);
        } else {
          console.error("Invalid specialization ID:", params['specialization']);
        }
      } else {
        console.error("Specialization ID is missing from route parameters.");
      }
    });

   
    this.loadSpecializationNames();

    this.activatedRoute.queryParams.subscribe(params => {
      console.log("Received filters:", params); // Debugging
      this.getFilteredDoctors(params);
    });
  }


  fetchDoctors(specializationId: number): void {
    if (!isNaN(specializationId)) {
      this.doctorService.getDoctorsBySpecialization(specializationId).subscribe(response => {
        this.doctors = response;
        this.filteredDoctors = [...this.doctors];
  
        console.log("Doctors fetched:", this.doctors);
  
        const uniqueClinicIds = Array.from(new Set(this.doctors.map(d => d.clinicId).filter(id => id !== undefined)));
  
        if (uniqueClinicIds.length > 0) {
          console.log("Fetching clinics for IDs:", uniqueClinicIds);
  
          forkJoin(
            uniqueClinicIds.map(clinicId =>
              this.clinicService.getClinicById(clinicId).pipe(
                map(clinic => ({ id: clinic.id, name: clinic.name_En })) // Adjust based on API response
              )
            )
          ).subscribe(clinics => {
            // ✅ Store clinics in an object for easy lookup
            this.clinics = {};
            clinics.forEach(clinic => {
              this.clinics[clinic.id] = clinic.name;
            });
  
            console.log("Clinics mapped:", this.clinics);
  
            this.filteredDoctors = [...this.doctors]; // Ensure UI updates
          }, error => {
            console.error("Error fetching clinics:", error);
          });
        }
      });
    }
  }
  




  loadSpecializationNames(): void {
    this.specializationService.getAllSpecializations().subscribe(specializations => {
      specializations.forEach(spec => {
        this.specializationNames[spec.id] = spec.name_En;
      });
    });
  }

  getSpecializationName(id: number): void {
    this.specializationService.getSpecializationById(id).subscribe(name => {
      this.specialization = name;
    });
  }

  getFilteredDoctors(filters: any): void {
    this.doctorService.getDoctorsByOptionalParams(filters).subscribe(
      (res) => {
        const response = res as { data?: Doctor[] };
        this.doctors = response.data || [];
      },
      (error) => console.error("Error fetching doctors", error)
    );
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }

  goToDoctorProfile(doctor: any): void {
    this.router.navigate(['/view-doctor-profile', doctor.id, doctor.specializationId]);

  }

  
  

}