import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';
import { APIResponse } from '../../shared/models/api-response.dto';
import { RoutesService } from '../../services/routes.service';
import { Router, RouterModule } from '@angular/router';
import { Lookup } from '../../shared/models/lookup.model';
import { LookupsService } from '../../services/lookups.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private routesService = inject(RoutesService);
  private lookupService = inject(LookupsService);
  private _router = inject(Router);
  private toastr = inject(ToastrService);

  public selectedPicture: File | null = null;
  genders: Lookup[] = [];
  countries: Lookup[] = [];
  governorates: Lookup[] = [];
  districts: Lookup[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      email: [''], // Optional
      dateOfBirth: [''], // Optional
      genderId: [null], // Optional
      countryId: [null], // Optional
      governorateId: [null], // Optional
      districtId: [null], // Optional
      profilePicture: [null], // Optional
      emergencyContactName: [''], // Optional
      emergencyContactPhone: [''], // Optional
      bloodType: [''], // Optional
    });
  }

  private loadLookups(): void {
    this.lookupService.loadGenders().subscribe(
      (res: APIResponse<Lookup[]>) => this.genders = res.data,
      () => this.toastr.error("Failed to load genders")
    );
    this.lookupService.loadCountries().subscribe(
      (res: APIResponse<Lookup[]>) => this.countries = res.data,
      () => this.toastr.error("Failed to load countries")
    );
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPicture = input.files[0];
      this.registerForm.patchValue({ profilePicture: this.selectedPicture });
      this.registerForm.get('profilePicture')?.updateValueAndValidity();
    } else {
      this.selectedPicture = null;
    }
  }

  updateGovernorates(countryId: string) {
    this.lookupService.loadGovernoratesOfCountry(Number.parseInt(countryId)).subscribe(
      (res: APIResponse<Lookup[]>) => this.governorates = res.data
    );
  }

  updateDistricts(governorateId: string) {
    this.lookupService.loadDistrictsOfGovernorate(Number.parseInt(governorateId)).subscribe(
      (res: APIResponse<Lookup[]>) => this.districts = res.data
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.toastr.warning("Please complete all required fields.", "Incomplete Data");
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.registerForm.value };
    const filteredFormValue = Object.keys(formValue).reduce((acc, key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: any });

    const formData = new FormData();
    Object.entries(filteredFormValue).forEach(([key, value]) => {
      if (key !== 'profilePicture') {
        formData.append(key, value as string);
      }
    });

    if (this.selectedPicture) {
      formData.append('profilePicture', this.selectedPicture);
    }

    this.authService.addNewPatient(formData).subscribe({
      next: () => {
        this.toastr.success("Registration successful! Please login.");
        this._router.navigate(['/login']);
      },
      error: (err) => {
        this.toastr.error("Failed to register. Please try again.");
      },
    });
  }

  get formControls() {
    return this.registerForm.controls;
  }
}