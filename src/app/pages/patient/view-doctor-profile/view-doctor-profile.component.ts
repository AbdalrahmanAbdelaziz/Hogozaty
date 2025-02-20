import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PHeaderComponent } from '../p-header/p-header.component';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { FormsModule } from '@angular/forms';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { BASE_URL } from '../../../shared/constants/urls';
import { SpecializationService } from '../../../services/specialization.service';

@Component({
  selector: 'app-view-doctor-profile',
  imports: [CommonModule, RouterModule, PHeaderComponent, FormsModule, SideNavbarComponent],
  templateUrl: './view-doctor-profile.component.html',
  styleUrl: './view-doctor-profile.component.css'
})
export class ViewDoctorProfileComponent implements OnInit {
  doctor: Doctor | null = null;
  specializationName: string = ''; // Store specialization name
  patient!: LoginResponse;
  BASE_URL = BASE_URL;
 
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private specializationService: SpecializationService, // Inject specialization service
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });

    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    const specializationId = Number(this.route.snapshot.paramMap.get('specializationId'));

    if (doctorId && specializationId) {
      this.fetchDoctorData(doctorId, specializationId);
    }
  }

  fetchDoctorData(doctorId: number, specializationId: number): void {
    this.doctorService.getDoctorsBySpecialization(specializationId).subscribe(
      (doctors: Doctor[]) => {
        this.doctor = doctors.find(doc => doc.id === doctorId) || null;
        if (this.doctor) {
          this.getSpecializationName(this.doctor.specializationId);
        }
      },
      (error) => {
        console.error('Error fetching doctor data:', error);
      }
    );
  }

  getSpecializationName(specializationId: number): void {
    this.specializationService.getSpecializationById(specializationId).subscribe(
      (name: string) => {
        this.specializationName = name;
      },
      (error) => {
        console.error('Error fetching specialization name:', error);
      }
    );
  }

  goToAppointments(): void {
    if (this.doctor) {
      this.router.navigate([`/doctor-appointments/${this.doctor.id}/${this.doctor.specializationId}`]);
    }
  }
}
