import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitted = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      EmailOrUsernameOrPhone: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }

  get fc() {
    return this.loginForm.controls;
  }
  
  

  submit(): void {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      this.toastr.warning("Please complete all required fields.", "Incomplete Data");
      return;
    }


    this.userService.login({
      EmailOrUsernameOrPhone: this.fc['EmailOrUsernameOrPhone'].value,
      password: this.fc['password'].value
    }).subscribe({
      next: (response) => {

    
        const userRole = response.data.applicationRole_En;
        console.log('User Role:', userRole); // Debugging
    
        if (userRole === 'Admin') {
          this.router.navigateByUrl('/admin-home');
        } else if (userRole === 'Doctor') {
          this.router.navigateByUrl('/doctor-home');
        } else if (userRole === 'Patient') {
          this.router.navigateByUrl('/patient-home');
        } else if (userRole === 'Secretary') {
          this.router.navigateByUrl('/secretary-home');
        } else {
          console.error('Unexpected user role:', userRole);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
      }
    });
    
}
}
