import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { DoctorService } from '../../../services/doctor.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { PHeaderComponent } from '../../patient/p-header/p-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmRescheduleModalComponent } from '../confirm-reschedule-modal/confirm-reschedule-modal.component';

@Component({
  selector: 'app-sec-doc-day-res',
  imports: [CommonModule, RouterModule, SHeaderComponent, SSidenavbarComponent, ConfirmRescheduleModalComponent],
  templateUrl: './sec-doc-day-res.component.html',
  styleUrls: ['./sec-doc-day-res.component.css']
})
export class SecDocDayResComponent implements OnInit {
  patient!: LoginResponse;
  selectedDate: string = '';
  timeSlots: any[] = [];
  docId!: number;
  clinicId: number = 0;
  specializationId: number = 0;
  appointmentId!: number;
  isModalVisible: boolean = false;
  selectedTimeSlot: any = null;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });

    this.selectedDate = this.route.snapshot.paramMap.get('date') || '';
    this.docId = Number(this.route.snapshot.paramMap.get('doctorId')) || 0;
    this.specializationId = Number(this.route.snapshot.paramMap.get('specializationId')) || 0;
    this.appointmentId = Number(this.route.snapshot.queryParams['appointmentId']) || 0;

    if (this.selectedDate && this.docId) {
      this.loadDoctorDetails();
      this.loadTimeSlots();
    } else {
      console.error('Date or Doctor ID is missing from route parameters.');
    }
  }

  loadDoctorDetails(): void {
    console.log('Fetching doctor details with doctorId:', this.docId);

    this.doctorService.getDoctorsBySpecialization(this.docId).subscribe(
      (doctors) => {
        if (doctors && doctors.length > 0) {
          const doctor = doctors[0];
          this.clinicId = doctor.clinicId;
          this.specializationId = doctor.specializationId;
          console.log('Updated Clinic ID:', this.clinicId);
          console.log('Updated Specialization ID:', this.specializationId);
        } else {
          console.warn('No doctor found with the given specialization ID.');
        }
      },
      (error) => {
        console.error('Error fetching doctor details:', error);
      }
    );
  }

  loadTimeSlots(): void {
    this.appointmentService.getTimeSlotsByDate(this.selectedDate, this.docId).subscribe(
      (response) => {
        this.timeSlots = response.data || [];
      }
    );
  }

  openModal(timeSlot: any): void {
    this.selectedTimeSlot = timeSlot;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedTimeSlot = null;
  }

  confirmReschedule(): void {
    if (!this.selectedTimeSlot || !this.appointmentId) {
      this.toastr.error("Missing required rescheduling information.", "Rescheduling Failed");
      return;
    }

    const rescheduleData = {
      appointmentId: this.appointmentId,
      newTimeSlotId: this.selectedTimeSlot.id
    };

    console.log("Reschedule Data:", rescheduleData);

    this.appointmentService.rescheduleAppointment(rescheduleData).subscribe(
      response => {
        this.toastr.success("Your appointment has been rescheduled successfully!");
        // this.router.navigate(['/appointments']);
      },
      error => {
        this.toastr.error("An error occurred while rescheduling. Please try again.");
      }
    );

    this.closeModal();
  }
}