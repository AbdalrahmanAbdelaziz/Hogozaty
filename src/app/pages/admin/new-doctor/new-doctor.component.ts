import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { APIResponse } from '../../../shared/models/api-response.dto';
import { Router, RouterModule } from '@angular/router';
import { Lookup } from '../../../shared/models/lookup.model';
import { LookupsService } from '../../../services/lookups.service';
import { ToastrService } from 'ngx-toastr';
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-new-doctor',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, AdminHeaderComponent],
  templateUrl: './new-doctor.component.html',
  styleUrls: ['./new-doctor.component.css']
})
export class NewDoctorComponent implements OnInit {
  doctorForm!: FormGroup;
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private lookupService = inject(LookupsService);
  private _router = inject(Router);
  private toastr = inject(ToastrService);

  selectedPicture: File | null = null;
  genders: Lookup[] = [];
  clinics: any[] = [];
  specializations: Lookup[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateOfBirth: ['', [Validators.required]],
      genderId: ['', [Validators.required]],
      clinicId: ['', [Validators.required]],
      specializationId: ['', [Validators.required]],
      brief: ['', [Validators.required]],
      checkPrice: ['', [Validators.required, Validators.min(0)]],
      profilePicture: [null]
    });
  }

  private loadLookups(): void {
    this.lookupService.loadGenders().subscribe(
      (res: APIResponse<Lookup[]>) => this.genders = res.data,
      () => this.toastr.error("Failed to load genders")
    );

    this.adminService.getAllClinics().subscribe(
      (res: APIResponse<any[]>) => this.clinics = res.data,
      () => this.toastr.error("Failed to load clinics")
    );

    this.adminService.getAllSpecializations().subscribe(
      (res: APIResponse<Lookup[]>) => this.specializations = res.data,
      () => this.toastr.error("Failed to load specializations")
    );
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPicture = input.files[0];
      this.doctorForm.patchValue({ profilePicture: this.selectedPicture });
      this.doctorForm.get('profilePicture')?.updateValueAndValidity();
    } else {
      this.selectedPicture = null;
    }
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.toastr.warning("Please complete all required fields.", "Incomplete Data");
      this.doctorForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.doctorForm.value };
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (key !== 'profilePicture' && value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    if (this.selectedPicture) {
      formData.append('profilePicture', this.selectedPicture);
    }

    this.adminService.createDoctor(formData).subscribe({
      next: () => {
        this.toastr.success("Doctor created successfully!");
        this._router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.toastr.error("Failed to create doctor. Please try again.");
        console.error(err);
      }
    });
  }

  get formControls() {
    return this.doctorForm.controls;
  }
}