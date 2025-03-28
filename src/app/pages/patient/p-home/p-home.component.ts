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
import { forkJoin, interval, map, Subscription, switchMap } from 'rxjs';
import { ClinicService } from '../../../services/clinic.service';
import { DoctorService } from '../../../services/doctor.service';
import { SpecializationService } from '../../../services/specialization.service';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { BASE_URL } from '../../../shared/constants/urls';
import { ToastrService } from 'ngx-toastr';

@Component({  
  selector: 'app-p-home',
  imports: [PHeaderComponent, CommonModule, MostChosenDoctorsComponent, RouterModule, SideNavbarComponent],
  templateUrl: './p-home.component.html',
  styleUrl: './p-home.component.css'
})
export class PHomeComponent {
  patient!: LoginResponse;
  appointments: any[] = [];
  filteredAppointments: any[] = []; // For Upcoming and In Progress appointments
  historyAppointments: any[] = []; // For Done appointments
  isHistoryModalOpen: boolean = false; // Controls the visibility of the history modal
  isCancelModalOpen: boolean = false; // Controls the visibility of the cancel confirmation modal
  selectedAppointmentId: number | null = null; // Stores the ID of the appointment to cancel
  currentIndex = 0; // For scrolling through appointments
  clinics: { [id: number]: Clinic } = {};
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializationId!: number;
  specializationNames: { [key: number]: string } = {};
  specialization: string = '';
  BASE_URL = BASE_URL;
  private pollingSubscription!: Subscription;
  

  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private toastr: ToastrService ,
     


  ) {}

  ngOnInit(): void {
    // Get patient data
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
        this.loadAppointments();
        this.startPolling();
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

  ngOnDestroy(): void {
    // Stop polling when the component is destroyed
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  startPolling(): void {
    // Poll every 5 seconds (5000 milliseconds)
    this.pollingSubscription = interval(60000)
      .pipe(
        switchMap(() => this.appointmentService.getAppointments(this.patient.data.id))
      )
      .subscribe({
        next: (response) => {
          console.log("Polling Response:", response);

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

                this.appointments.forEach(
                  ap => {
                    this.doctorService.getDoctorsByOptionalParams({ id: ap.doctorId }).subscribe(
                      (doc) => {
                        ap.doctorProfilePicture = doc.data[0].profilePicture;
                        this.clinicService.getClinicById(doc.data[0].clinicId).subscribe(
                          (c) => {
                            ap.clinicName = c.data.name;
                          }
                        );
                      }
                    );
                  }
                );

                // Filter appointments for the main section (Upcoming and In Progress)
                this.filteredAppointments = this.appointments.filter(
                  appt => appt.appointmentStatus_En === 'UpComing' || appt.appointmentStatus_En === 'Arrived' || appt.appointmentStatus_En === 'NextInQueue' || appt.appointmentStatus_En === 'InProgress'
                );

                // Filter appointments for the history modal (Done)
                this.historyAppointments = this.appointments.filter(
                  appt => appt.appointmentStatus_En === 'Proccessed'
                );

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
        },
        error: (error) => {
          console.error("Polling error:", error);
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
  
        // Extract unique clinic IDs
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

            this.appointments.forEach(
              ap => {
                this.doctorService.getDoctorsByOptionalParams({ id: ap.doctorId }).subscribe(
                  (doc) => {
                    ap.doctorProfilePicture = doc.data[0].profilePicture;
                    this.clinicService.getClinicById(doc.data[0].clinicId).subscribe(
                      (c) => {
                        ap.clinicName = c.data.name;
                      }
                    );
                  }
                );
              }
            );

            // Filter appointments for the main section (Upcoming and In Progress)
            this.filteredAppointments = this.appointments.filter(
              appt => appt.appointmentStatus_En === 'UpComing' || appt.appointmentStatus_En === 'Arrived' || appt.appointmentStatus_En === 'NextInQueue' || appt.appointmentStatus_En === 'InProgress'
            );

            // Filter appointments for the history modal (Done)
            this.historyAppointments = this.appointments.filter(
              appt => appt.appointmentStatus_En === 'Proccessed'
            );

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

  // Open history modal
  openHistoryModal(): void {
    this.isHistoryModalOpen = true;
  }

  // Close history modal
  closeHistoryModal(): void {
    this.isHistoryModalOpen = false;
  }

  openCancelModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.isCancelModalOpen = true;
  }

  // Close cancel confirmation modal
  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.selectedAppointmentId = null;
  }

  // Confirm cancellation
  confirmCancel(): void {
    if (this.selectedAppointmentId) {
      this.appointmentService.cancelAppointment(this.selectedAppointmentId).subscribe({
        next: () => {
          this.toastr.success('Appointment cancelled successfully!');
          this.appointments = this.appointments.filter((appt) => appt.id !== this.selectedAppointmentId);
          this.filteredAppointments = this.filteredAppointments.filter((appt) => appt.id !== this.selectedAppointmentId);
          this.closeCancelModal();
        },
        error: (err) => {
          this.toastr.error('Failed to cancel appointment. Please try again.');
          this.closeCancelModal();
        }
      });
    }
  }




  reschedule(appointmentId: number, doctorId: number): void {
    this.router.navigate([`/doctor-appointments-reschedual/${doctorId}/-1/-1`], {
      queryParams: { isReschedule: true, appointmentId: appointmentId }
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