import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PHeaderComponent } from '../p-header/p-header.component';
import { Specialization, SpecializationService } from '../../../services/specialization.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { ClinicService } from '../../../services/clinic.service';
import { Clinic } from '../../../shared/models/clinic.model';
import { forkJoin, map } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/urls';

@Component({
  selector: 'app-select-specialization',
  imports: [CommonModule, RouterModule, PHeaderComponent],
  templateUrl: './select-specialization.component.html',
  styleUrl: './select-specialization.component.css'
})
export class SelectSpecializationComponent implements OnInit {
  patient!: LoginResponse;
  specialization: string = '';
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchTerm: string = '';
  specializationNames: { [key: number]: string } = {}; // Store specialization names
  clinics: { [id: number]: Clinic } = {}; // Store clinics by ID
  specializationId!: number;
  BASE_URL = BASE_URL;
  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private clinicService: ClinicService

  ) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      } 
    });
  
    this.loadSpecializationNames(); // ✅ Load specializations first
  
    this.activatedRoute.params.subscribe(params => {
      if (params['specialization']) {
        const specializationId = Number(params['specialization']);
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
  }
  
  
  

  fetchDoctors(specializationId: number): void {
    if (!isNaN(specializationId)) {
      this.doctorService.getDoctorsBySpecialization(specializationId).subscribe(doctors => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
  
        console.log("Doctors fetched:", doctors);
  
        const uniqueClinicIds = Array.from(new Set(doctors.map(d => d.clinicId).filter(id => id)));
  
        if (uniqueClinicIds.length > 0) {
          console.log("Fetching clinics for IDs:", uniqueClinicIds);
  
          forkJoin(
            uniqueClinicIds.map(clinicId =>
              this.clinicService.getClinicById(clinicId).pipe(
                map(response => {
                  var clinic = response.data;
                  this.clinics[clinic.id] = clinic;
                  console.log(`Clinic ${clinic.id} fetched:`, clinic);
                })
              )
            )
          ).subscribe(() => {
            console.log("All clinics fetched. Updating UI...");
            this.filteredDoctors = [...this.doctors]; // Ensure UI refresh
          }, error => {
            console.error("Error fetching clinics:", error);
          });
        }
      });
    } 
  }
  
  
  
  
  

  // Fetch and store all specialization names
  loadSpecializationNames(): void {
    this.specializationService.getAllSpecializations().subscribe(specializations => {
      specializations.forEach(spec => {
        this.specializationNames[spec.id] = spec.name_En;
      });
    });
  }

  // Fetch specialization name by ID
  getSpecializationName(id: number): void {
    this.specializationService.getSpecializationById(id).subscribe(name => {
      this.specialization = name;
    });
  }

  search(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredDoctors = this.doctors.filter(doctor =>
      doctor.firstName.toLowerCase().includes(this.searchTerm) ||
      doctor.clinicId.toString().toLowerCase().includes(this.searchTerm)
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
