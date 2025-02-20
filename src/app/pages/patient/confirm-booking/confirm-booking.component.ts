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
import { APIResponse } from '../../../shared/models/api-response.dto';
import { BASE_URL } from '../../../shared/constants/urls';
import { ToastrService } from 'ngx-toastr';

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
  BASE_URL = BASE_URL;


  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private toastr: ToastrService // ✅ Inject ToastrService

  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const doctorId = Number(params['doctorId']);
      const timeSlotId = Number(params['slotId']);
  
      if (doctorId) {
        console.log("Query Params:", this.activatedRoute.snapshot.queryParams);

        this.getDoctorDetails(doctorId);
      }
      if (timeSlotId) {
        this.getTimeSlotDetails(timeSlotId);
      }
    });
  
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });
  }
  
  getClinicDetails(clinicId: number) {
    this.clinicService.getClinicById(clinicId).subscribe(
      (response: APIResponse<Clinic>) =>{
        this.clinic = response.data;
      }
    )
  }

  getTimeSlotDetails(timeSlotId: number) {
    this.appointmentService.getTimeSlotById(timeSlotId).subscribe(
      (response: APIResponse<TimeSlot>) =>{
        this.selectedTimeSlot = response.data;
      }
    )
  }


  getDoctorDetails(doctorId: number): void {          
    this.doctorService.getDoctorsByOptionalParams({ id: doctorId }).subscribe(
      (response: APIResponse<Doctor[]>) => {
        var doctors = response.data;
        if (doctors.length > 0) {
          
          this.selectedDoctor = doctors[0];  // Set doctor data
          this.specializationService.getSpecializationById(this.selectedDoctor.specializationId).subscribe((name) => {
            this.specialization = name;
            // this.specializations.push({ id, name });
          });       
          this.getClinicDetails(this.selectedDoctor.clinicId);

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
      this.toastr.error("Missing required booking information.", "Booking Failed");
      return;
    }
  
    const bookingData: Appointment = {
      notes: this.notes,
      timeSlotId: this.selectedTimeSlot.id,
      clinicId: this.clinic.id,
      doctorId: this.selectedDoctor.id,
      patientID: this.patient.data.id
    };
  
    this.appointmentService.createAppointment(bookingData).subscribe(
      response => {
        this.toastr.success("Your appointment has been booked successfully!");
        // this.router.navigate(['/appointments']);
      },
      error => {
        this.toastr.error("An error occurred while booking. Please try again.");
      }
    );
  }
  
  
}
