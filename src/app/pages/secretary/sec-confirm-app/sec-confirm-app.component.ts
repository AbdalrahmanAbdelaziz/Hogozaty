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
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { FormsModule } from '@angular/forms';
import { APIResponse } from '../../../shared/models/api-response.dto';
import { BASE_URL } from '../../../shared/constants/urls';
import { ToastrService } from 'ngx-toastr';
import { SHeaderComponent } from '../s-header/s-header.component';
import { PatientService } from '../../../services/patient.service'; // Import PatientService
import { Patient } from '../../../shared/models/patient';

@Component({
  selector: 'app-sec-confirm-app',
  standalone: true,
  imports: [CommonModule, RouterModule, SHeaderComponent, SSidenavbarComponent, FormsModule],
  templateUrl: './sec-confirm-app.component.html',
  styleUrl: './sec-confirm-app.component.css'
})
export class SecConfirmAppComponent implements OnInit {
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
  patientId!: number; // Add patientId
  patient!: Patient; // Add patient object

  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private toastr: ToastrService, // ✅ Inject ToastrService
    private patientService: PatientService // Inject PatientService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("Received Query Params:", params); // Log the received query parameters
      const doctorId = Number(params['doctorId']);
      const timeSlotId = Number(params['slotId']);
      this.patientId = Number(params['patientId']); // Get patientId from query params

      if (doctorId) {
        console.log("Fetching details for Doctor ID:", doctorId); // Log the doctorId being used
        this.getDoctorDetails(doctorId);
      }
      if (timeSlotId) {
        this.getTimeSlotDetails(timeSlotId);
      }
      if (this.patientId) {
        this.getPatientDetails(this.patientId); // Fetch patient details
      }
    });

    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        // Handle user changes if needed
      }
    });
  }

  getClinicDetails(clinicId: number) {
    this.clinicService.getClinicById(clinicId).subscribe(
      (response: APIResponse<Clinic>) => {
        this.clinic = response.data;
      }
    );
  }

  getTimeSlotDetails(timeSlotId: number) {
    this.appointmentService.getTimeSlotById(timeSlotId).subscribe(
      (response: APIResponse<TimeSlot>) => {
        this.selectedTimeSlot = response.data;
      }
    );
  }

  getDoctorDetails(doctorId: number): void {
    console.log("Fetching details for Doctor ID:", doctorId); // Log the doctorId being used

    // Prepare the request body as expected by the backend
    const requestBody = {
      doctorId: doctorId, // Include the doctorId
    };

    this.doctorService.getDoctorsByOptionalParams(requestBody).subscribe(
      (response: APIResponse<Doctor[]>) => {
        const doctors = response.data;
        if (doctors.length > 0) {
          this.selectedDoctor = doctors[0];
          console.log("Selected Doctor:", this.selectedDoctor); // Log the selected doctor
          this.specializationService.getSpecializationById(this.selectedDoctor.specializationId).subscribe((name) => {
            this.specialization = name;
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

  getPatientDetails(patientId: number): void {
    this.patientService.getPatientById(patientId).subscribe(
      (response: APIResponse<Patient>) => {
        this.patient = response.data; // Store patient details
        console.log("Patient Details:", this.patient); // Log patient details
      },
      (error) => {
        console.error("Error loading patient details:", error);
      }
    );
  }

  confirmBooking(): void {
    if (!this.selectedDoctor || !this.selectedTimeSlot || !this.clinic || !this.patient) {
      this.toastr.error("Missing required booking information.", "Booking Failed");
      return;
    }

    if (!this.selectedTimeSlot.id || !this.clinic.id || !this.selectedDoctor.id || !this.patient.id) {
      this.toastr.error("Invalid appointment details. Please try again.", "Booking Failed");
      return;
    }

    const bookingData: Appointment = {
      notes: this.notes,
      timeSlotId: this.selectedTimeSlot.id,
      clinicId: this.clinic.id,
      doctorId: this.selectedDoctor.id,
      patientID: this.patient.id // Use patient.id
    };

    console.log("Booking Data:", bookingData); // Log the payload

    this.appointmentService.createAppointment(bookingData).subscribe(
      response => {
        this.toastr.success("Your appointment has been booked successfully!");
        // this.router.navigate(['/patient-home']);
      },
      error => {
        this.toastr.error("An error occurred while booking. Please try again.");
      }
    );
  }
}