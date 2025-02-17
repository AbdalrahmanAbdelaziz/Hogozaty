import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { Clinic } from '../../../shared/models/clinic.model';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { SpecializationService } from '../../../services/specialization.service';
import { UserService } from '../../../services/user.service';
import { ClinicService } from '../../../services/clinic.service';
import { Appointment, TimeSlot } from '../../../shared/models/appointment.model';
import { forkJoin, map } from 'rxjs';
import { PHeaderComponent } from '../p-header/p-header.component';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-booking',
  imports: [CommonModule, RouterModule, PHeaderComponent, SideNavbarComponent, FormsModule],
  templateUrl: './confirm-booking.component.html',
  styleUrl: './confirm-booking.component.css'
})
export class ConfirmBookingComponent implements OnInit {
  patient!: LoginResponse;
  doctors: Doctor[] = [];
  selectedDoctor?: Doctor;
  selectedTimeSlot?: TimeSlot;
  specialization: string = '';
  clinic?: Clinic;
  filteredDoctors: Doctor[] = [];
  specializations: { id: number; name: string }[] = [];
  selectedSpecialization: string = '';
  appointments: any[] = [];
  clinics: { [id: number]: string } = {}; // Store only clinic names
  specializationId!: number;
  specializationNames: { [key: number]: string } = {};
  doctor!: Doctor; // Add this in the class
  notes: string = ''; // Stores user input for notes



  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const doctorId = Number(params['doctorId']);
      const clinicId = Number(params['clinicId']);
      const timeSlotId = Number(params['slotId']);
  
      if (doctorId) {
        console.log("Query Params:", this.activatedRoute.snapshot.queryParams);

        this.getDoctorDetails(doctorId);
      }
  
      // if (clinicId) {
      //   this.getClinicDetails(clinicId);
      // }
  
      // if (timeSlotId) {
      //   this.getTimeSlotDetails(timeSlotId);
      // }
    });
  
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });
  }
  

  getDoctorDetails(doctorId: number): void {
    this.doctorService.getDoctorsByOptionalParams({ id: doctorId }).subscribe(
      (doctors) => {
        if (doctors.length > 0) {
          this.selectedDoctor = doctors[0];  // ✅ Set doctor data
          console.log("Doctor loaded:", this.selectedDoctor);
        } else {
          console.warn("No doctor found for ID:", doctorId);
        }
      },
      (error) => {
        console.error("Error loading doctor details:", error);
      }
    );
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
  
        // If the route contains a doctor ID, find the doctor
        this.activatedRoute.queryParams.subscribe(params => {
          const doctorId = Number(params['doctorId']);
          if (doctorId) {
            this.doctor = this.doctors.find(d => d.id === doctorId) || doctors[0];
            console.log("🩺 Selected Doctor:", this.doctor);
          }
        });
  
        // Fetch clinics dynamically
        const uniqueClinicIds = Array.from(new Set(doctors.map(d => d.clinicId).filter(id => id !== null)));
  
        if (uniqueClinicIds.length > 0) {
          forkJoin(
            uniqueClinicIds.map(clinicId =>
              this.clinicService.getClinicById(clinicId).pipe(
                map(clinic => {
                  return { id: clinicId, name: clinic?.name || 'Unknown Clinic' };
                })
              )
            )
          ).subscribe(clinicData => {
            clinicData.forEach(clinic => {
              this.clinics[clinic.id] = clinic.name;
            });
  
            this.filteredDoctors = [...this.doctors]; // Force UI update
          });
        }
      });
    }
  }
  

  getSpecializationName(id: number): string {
    const spec = this.specializations.find((s) => s.id === id);
    return spec ? spec.name : 'Unknown';
  }

  
  filterDoctors(specialization: string): void {
    this.selectedSpecialization = specialization;
    this.filteredDoctors = this.doctors.filter((doctor) =>
      this.getSpecializationName(doctor.specializationId) === specialization
    );
  }

  

  
  
  

  



  confirmBooking(): void {
    if (!this.selectedDoctor || !this.selectedTimeSlot || !this.clinic || !this.patient) {
      console.error("Missing required booking information.");
      return;
    }
  
    // ✅ Ensure `timeSlot` is an object, not just an ID
    const bookingData: Appointment = {
      notes: this.notes, // Include notes entered by the user
      timeSlot: this.selectedTimeSlot,
      clinicId: this.clinic.id,
      doctorId: this.selectedDoctor.id,
      patientID: this.patient.data.id
    };
  
    this.appointmentService.createAppointment(bookingData).subscribe(
      response => {
        console.log("Booking confirmed:", response);
        this.router.navigate(['/appointments']);
      },
      error => {
        console.error("Error confirming booking:", error);
      }
    );
  }
  
}
