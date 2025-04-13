import { Component, OnInit } from '@angular/core';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { SpecializationService } from '../../../services/specialization.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { Clinic } from '../../../shared/models/clinic.model';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { ClinicService } from '../../../services/clinic.service';
import { forkJoin, map } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/urls';

@Component({
  selector: 'app-most-chosen-doctors',
  imports: [CommonModule],
  templateUrl: './most-chosen-doctors.component.html',
  styleUrl: './most-chosen-doctors.component.css'
})
export class MostChosenDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializations: { id: number; name: string }[] = [];
  selectedSpecialization: string = '';
  patient!: LoginResponse;
  appointments: any[] = [];
  clinics: { [id: number]: string } = {}; // Store only clinic names
  specializationId!: number;
  specializationNames: { [key: number]: string } = {};
  specialization: string = '';
  BASE_URL = BASE_URL;
    

  constructor(private doctorService: DoctorService, 
               private userService: UserService, 
                     private router: Router,
                      private activatedRoute: ActivatedRoute,
                      private appointmentService: AppointmentService,
                       private clinicService: ClinicService,
                       private specializationService: SpecializationService

  ) {}

  ngOnInit(): void {
    this.selectedSpecialization = 'General';

    this.loadDoctors();

    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;

      }

      
    });

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
  

  loadDoctors(): void {
    this.doctorService.getTopDoctors().subscribe((data) => {
      this.doctors = data;
      this.filteredDoctors = data;
      

      // Fetch specializations
      const uniqueSpecializationIds = [...new Set(data.map((doctor) => doctor.specializationId))];

      // Retrieve specialization names
      uniqueSpecializationIds.forEach((id) => {
        this.specializationService.getSpecializationById(id).subscribe((name) => {
          this.specializations.push({ id, name });
        });
      });
    });
  }

  
  
     
  
  fetchDoctors(specializationId: number): void {
    if (!isNaN(specializationId)) {
      this.doctorService.getDoctorsBySpecialization(specializationId).subscribe(doctors => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
  
        console.log("✅ Fetched doctors:", doctors);
  
        const uniqueClinicIds = Array.from(new Set(doctors.map(d => d.clinicId).filter(id => id !== null)));
  
        console.log("🔍 Unique clinic IDs:", uniqueClinicIds);
  
        if (uniqueClinicIds.length > 0) {
          forkJoin(
            uniqueClinicIds.map(clinicId =>
              this.clinicService.getClinicById(clinicId).pipe(
                map(response => {
                  var clinic = response.data;
                  console.log(`🏥 Fetched clinic ID ${clinicId}:`, clinic);
                  return { id: clinicId, name: clinic?.name || 'Unknown Clinic' };
                })
              )
            )
          ).subscribe(clinicData => {
            console.log("📋 Final clinic data:", clinicData);
  
            clinicData.forEach(clinic => {
              this.clinics[clinic.id] = clinic.name; // Store clinics dynamically
            });
  
            console.log("🏥 Updated clinics mapping:", this.clinics);
  
            this.filteredDoctors = [...this.doctors]; // Force UI update
          }, error => {
            console.error("❌ Error fetching clinics:", error);
          });
        }
      });
    }
  }
  
  

  
  
  
  
        

filterDoctors(specialization: string): void {
  this.selectedSpecialization = specialization;

  if (specialization === 'General') {
    this.filteredDoctors = this.doctors; // Show all doctors
  } else {
    this.filteredDoctors = this.doctors.filter((doctor) =>
      this.getSpecializationName(doctor.specializationId) === specialization
    );
  }
}



  getSpecializationName(id: number): string {
    const spec = this.specializations.find((s) => s.id === id);
    return spec ? spec.name : 'Unknown';
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0); 
  }

  goToDoctorProfile(doctor: Doctor): void {
    this.router.navigate(
      ['/view-doctor-profile', doctor.id, doctor.specializationId],
      { queryParams: { clinicId: doctor.clinicId } }
    );
  }
  
  
  
}