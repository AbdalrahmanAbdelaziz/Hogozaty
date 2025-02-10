import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';
import { APIResponse } from '../../shared/models/api-response.dto';
import { LoginResponse } from '../../shared/models/login-response';
import { RoutesService } from '../../services/routes.service';
import { authenticationRoutingObject } from '../../authentication-routing';
import { RouterModule } from '@angular/router';
import { ToastrService } from '../../services/toastr.service';
import { Lookup } from '../../shared/models/lookup.model';
import { LookupsService } from '../../services/lookups.service';

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
  private toastrService = inject(ToastrService);
  private lookupService = inject(LookupsService);

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
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      profilePicture: [null], 
      genderId: [null, [Validators.required]],
      countryId: [null, [Validators.required]],
      governorateId: [null, [Validators.required]],
      districtId: [null, [Validators.required]],
      emergencyContactName: ['', [Validators.required]],
      emergencyContactPhone: ['', [Validators.required]],
      bloodType: [''],
    });
  }

  private loadLookups(): void {
    this.lookupService.loadGenders().subscribe(
      (res: APIResponse<Lookup[]>) => this.genders = res.data,
      () => this.toastrService.showError("Failed to load genders")
    );
    this.lookupService.loadCountries().subscribe(
      (res: APIResponse<Lookup[]>) => this.countries = res.data,
      () => this.toastrService.showError("Failed to load countries")
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
    if (!this.selectedPicture) {
      this.toastrService.showError("Please select a profile picture!");
      return;
    }

    if (this.registerForm.valid) {
      const formData = new FormData();
      Object.entries(this.registerForm.value).forEach(([key, value]) => {
        if (key !== 'profilePicture') {
          formData.append(key, value as string);
        }
      });
      if (this.selectedPicture) {
        formData.append('profilePicture', this.selectedPicture);
      }

      this.authService.addNewPatient(formData).subscribe({
        next: () => {
          this.toastrService.showSuccess("Registration successful!");
          this.routesService.navigateToRoute(authenticationRoutingObject.routes.login);
        },
        error: (err) => {
          this.toastrService.showError("Registration failed");
          console.error("Registration error:", err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  get formControls() {
    return this.registerForm.controls;
  }
}
