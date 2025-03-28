import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SSidenavbarComponent } from '../s-sidenavbar/s-sidenavbar.component';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-new-patient-add-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, SHeaderComponent, SSidenavbarComponent],
  templateUrl: './new-patient-add-phone.component.html',
  styleUrl: './new-patient-add-phone.component.css'
})
export class NewPatientAddPhoneComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = ''; // Phone number field
  docId!: number;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.docId = +params['docId']; // Retrieve only docId
      this.phoneNumber = params['phoneNumber'] || ''; // Retrieve the phone number

      if (!this.docId) {
        console.error('No doctor ID found in query parameters.');
      }
    });
  }

  

  submitAppointment(): void {
    if (!this.firstName || !this.lastName || !this.phoneNumber) {
      this.toastr.warning('Please fill all fields.');
      return;
    }
  
    const formData = new FormData();
    formData.append('firstName', this.firstName);
    formData.append('lastName', this.lastName);
    formData.append('phoneNumber', this.phoneNumber);
  
    this.authService.addNewPatient(formData).subscribe(
      (response: any) => {
        console.log('Backend Response:', response); // Log the full response for debugging
  
        // Check if the response contains the patient ID
        if (response && response.data) {
          const patientId = response.data; 
          // this.toastr.success('Patient registered successfully!');
  
          this.firstName = '';
          this.lastName = '';
          this.phoneNumber = '';
  
          // Navigate with docId and patientId
          this.router.navigate([
            `/sec-doctor-appointments/${this.docId}/${patientId}`
          ]);
        } else {
          this.toastr.error('Failed to retrieve patient ID from the response.');
          console.error('Response does not contain patient ID:', response);
        }
      },
      (error) => {
        this.toastr.error('Failed to register patient. Try again.');
        console.error('Error during patient registration:', error);
      }
    );
  }
}