import { Component } from '@angular/core';
import { PHeaderComponent } from "../p-header/p-header.component";
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Appointment } from '../../../shared/models/appointment.model';
import { AppointmentService } from '../../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { MostChosenDoctorsComponent } from '../most-chosen-doctors/most-chosen-doctors.component';
import { Clinic } from '../../../shared/models/clinic.model';
import { Doctor } from '../../../shared/models/doctor.model';
import { forkJoin, map } from 'rxjs';
import { ClinicService } from '../../../services/clinic.service';
import { DoctorService } from '../../../services/doctor.service';
import { SpecializationService } from '../../../services/specialization.service';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { BASE_URL } from '../../../shared/constants/urls';

@Component({
  selector: 'app-p-home',
  imports: [PHeaderComponent, CommonModule, MostChosenDoctorsComponent, RouterModule, SideNavbarComponent],
  templateUrl: './p-home.component.html',
  styleUrl: './p-home.component.css'
})
export class PHomeComponent {
  patient!: LoginResponse;
  appointments: any[] = [];
  searchTerm = '';
  currentIndex = 0; // For scrolling through appointments
  clinics: { [id: number]: Clinic } = {};
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializationId!: number;
  specializationNames: { [key: number]: string } = {};
  specialization: string = '';
  BASE_URL = BASE_URL;


  


  

   constructor( private doctorService: DoctorService,
       private specializationService: SpecializationService,
       private userService: UserService, 
       private router: Router,
        private activatedRoute: ActivatedRoute,
        private appointmentService: AppointmentService,
         private clinicService: ClinicService){

  
    }

    ngOnInit(): void {
      // Get patient data
      this.userService.userObservable.subscribe((newUser) => {
        if (newUser) {
          this.patient = newUser;
          this.loadAppointments();
        }

        this.activatedRoute.params.subscribe((params: { searchTerm?: string }) => {
          if (params['searchTerm']) { 
            this.searchTerm = params['searchTerm']; 
          }
        });
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

  

    getSpecializationName(id: number): void {
    this.specializationService.getSpecializationById(id).subscribe(name => {
      this.specialization = name;
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
      


      loadAppointments(): void {
        this.appointmentService.getAppointments(this.patient.data.id).subscribe((response) => {
          console.log("API Response:", response);
      
          if (response.succeeded) {
            let fetchedAppointments: Appointment[] = [];
      
            if (Array.isArray(response.data)) {
              fetchedAppointments = response.data;
            } else if (typeof response.data === "object" && response.data !== null) {
              fetchedAppointments = [response.data]; // Convert single object to array
            } else {
              console.error("Unexpected response format:", response.data);
              return;
            }
      
            // Extract unique clinic IDs
            const clinicIds = Array.from(new Set(fetchedAppointments.map(appt => appt.clinicId)));
      
            if (clinicIds.length > 0) {
              forkJoin(
                clinicIds.map(id => this.clinicService.getClinicById(id))
              ).subscribe(clinicResponses => {
                // Create a mapping of clinic ID to clinic data
                clinicResponses.forEach(response => {
                  if (response.Succeeded && response.data) {
                    this.clinics[response.data.id] = response.data; // Store clinic data
                  } else {
                    console.error("Error fetching clinic data:", response);
                  }
                });
      
                // Map clinic ID to clinic name in appointments
                this.appointments = fetchedAppointments.map(appt => ({
                  ...appt,
                  clinicName: this.clinics[appt.clinicId]?.name || 'Unknown'
                }));
      
                // Sort appointments by date (newest first)
                this.appointments.sort(
                  (a, b) => new Date(b.timeSlot.date).getTime() - new Date(a.timeSlot.date).getTime()
                );
              });
            } else {
              this.appointments = fetchedAppointments;
            }
          } else {
            console.error("API call failed:", response);
          }
        });
      }
      
      
    
    
      
      cancelAppointment(appointmentId: number): void {
        this.appointmentService.cancelAppointment(appointmentId).subscribe(() => {
          this.appointments = this.appointments.filter((appt) => appt.id !== appointmentId);
        });
      }
    
      nextCard(): void {
        if (this.currentIndex < this.appointments.length - 3) {
          this.currentIndex++;
        }
      }
      
      prevCard(): void {
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
      }
  
    

   

  
   
    
      
    

}
