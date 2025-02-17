import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PHeaderComponent } from '../p-header/p-header.component';
import { UserService } from '../../../services/user.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { Specialization, SpecializationService } from '../../../services/specialization.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { RoutesService } from '../../../services/routes.service';
import { ToastrService } from 'ngx-toastr';
import { LookupsService } from '../../../services/lookups.service';
import { Lookup } from '../../../shared/models/lookup.model';
import { APIResponse } from '../../../shared/models/api-response.dto';
import { Doctor } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';

@Component({
  selector: 'app-choose-appointment',
  imports: [CommonModule, RouterModule, PHeaderComponent, ReactiveFormsModule, FormsModule, SideNavbarComponent],
  templateUrl: './choose-appointment.component.html',
  styleUrl: './choose-appointment.component.css'
})
export class ChooseAppointmentComponent implements OnInit{
  isCollapsed: boolean = false;
  specializations: Specialization[] = [];
  filteredSpecializations: Specialization[] = [];
  searchTerm: string = '';
  patient!: LoginResponse;
  specializationNames: { [id: number]: string } = {};

   locationForm!: FormGroup;
    private fb = inject(FormBuilder);
    private authService = inject(AuthenticationService);
    private routesService = inject(RoutesService);
    private toastrService = inject(ToastrService);
    private lookupService = inject(LookupsService);

    doctors: Doctor[] = [];
    
 constructor(private userService: UserService, private router: Router, private activatedRoute: ActivatedRoute, private specializationService: SpecializationService, private doctorService: DoctorService){}


    countries: Lookup[] = [];
    governorates: Lookup[] = [];
    districts: Lookup[] = [];


  ngOnInit(): void {

    this.initForm();
    this.loadLookups();


    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }

      this.activatedRoute.params.subscribe((params: { searchTerm?: string }) => {
        if (params['searchTerm']) { 
          this.searchTerm = params['searchTerm']; 
        }
      });
    });

    this.specializationService.getAllSpecializations().subscribe(specializations => {
      this.specializationNames = {};
      specializations.forEach(spec => {
        this.specializationNames[spec.id] = spec.name_En; // Store specializationId -> specializationName mapping
      });
    });

    this.getSpecializations();

  }

  

   private initForm(): void {
        this.locationForm = this.fb.group({
          countryId: [null, [Validators.required]],
          governorateId: [null, [Validators.required]],
          districtId: [null, [Validators.required]],
          specializationId: [null, [Validators.required]]
        });
      }
  
      private loadLookups(): void {
        this.lookupService.loadCountries().subscribe(
            (res: APIResponse<Lookup[]>) => this.countries = res.data,
            () => this.toastrService.error("Failed to load countries", "Error")
        );
    
        this.specializationService.getAllSpecializations().subscribe(
            (res: Specialization[]) => this.specializations = res,
            () => this.toastrService.error("Failed to load specializations", "Error")
        );
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

  filterDoctors(): void {
    if (this.locationForm.valid) {
      const filters = this.locationForm.value;
      this.router.navigate(['/filtered-doctors'], { queryParams: filters });
    } else {
      this.toastrService.error("Please fill in all required fields.", "Error");
    }
  }
  


  
  
        
  
get formControls() {
  return this.locationForm.controls;
}
  


  getSpecializationIcon(specialization: string): string {
  const icons: { [key: string]: string } = {
    Dentist: 'fas fa-tooth',
    GeneralPractitioner: 'fas fa-user-md',
    Cardiologist: 'fas fa-heartbeat',
    Psychiatrist: 'fas fa-brain',
    Neurologist: 'fas fa-brain',
    Dermatologist: 'fas fa-air-freshener',
    OrthopedicSurgeon: 'fas fa-bone',
    Pediatrician: 'fas fa-baby',
    Gynecologist: 'fas fa-venus',
    Urologist: 'fas fa-procedures',
    ENT_Specialist: 'fas fa-ear-listen',
    Ophthalmologist: 'fas fa-eye',
    Radiologist: 'fas fa-x-ray',
    Oncologist: 'fas fa-ribbon',
    Endocrinologist: 'fas fa-dna',
    Gastroenterologist: 'fas fa-utensils', // Use 'fa-stomach' for GI specialist
    Pulmonologist: 'fas fa-lungs',
    Rheumatologist: 'fas fa-hands-helping',
    Nephrologist: 'fas fa-filter',
    PlasticSurgeon: 'fas fa-user-edit',
    Anesthesiologist: 'fas fa-syringe',
    Pathologist: 'fas fa-vials',
    Hematologist: 'fas fa-tint',
    Allergist: 'fas fa-allergies',
    Immunologist: 'fas fa-shield-virus',
    InfectiousDiseaseSpecialist: 'fas fa-virus',
    Geriatrician: 'fas fa-blind',
    EmergencyMedicineSpecialist: 'fas fa-ambulance',
    CriticalCareSpecialist: 'fas fa-procedures',
    SportsMedicineSpecialist: 'fas fa-running',
    FamilyPhysician: 'fas fa-user-nurse',
    OccupationalTherapist: 'fas fa-briefcase-medical',
    Physiotherapist: 'fas fa-walking',
    Dietitian: 'fas fa-apple-alt',
    Chiropractor: 'fas fa-hand-holding-medical', // Chiropractor using an appropriate icon
  };

  return icons[specialization] || 'fas fa-user-md'; // Default icon if not found
}

  

getSpecializations(): void {
  this.specializationService.getAllSpecializations().subscribe(
    (response: Specialization[]) => { // Ensure it's an array
      this.specializations = response;
      this.filteredSpecializations = response;
    },
    (error) => {
      console.error('Error fetching specializations:', error);
    }
  );
}


  

  search(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filteredSpecializations = this.specializations.filter(spec =>
      spec.name_En.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  


  logout(){
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(link: string){
    this.router.navigate([link]);
  }

  // search(term: string):void{
  //   if(term)
  //     this.router.navigateByUrl('/search/' + term)
  // }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

}
