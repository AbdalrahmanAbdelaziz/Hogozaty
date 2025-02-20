import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Import MatDialog
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
import { PHeaderComponent } from '../p-header/p-header.component';
import { UserService } from '../../../services/user.service';
import { LoginResponse } from '../../../shared/models/login-response';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfilePictureDialogComponent } from '../profile-picture-dialog/profile-picture-dialog.component';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BASE_URL } from '../../../shared/constants/urls';

@Component({
  selector: 'app-p-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,  
    SideNavbarComponent,
    PHeaderComponent,
    ReactiveFormsModule
  ],
  templateUrl: './p-profile.component.html',
  styleUrl: './p-profile.component.css'
})
export class PProfileComponent implements OnInit {
  patient!: LoginResponse;
  profileForm!: FormGroup;
  BASE_URL = BASE_URL;
  constructor(private userService: UserService, private fb: FormBuilder, private dialog: MatDialog, private http: HttpClient, 
    private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
        this.initForm();
      }
    });
  }

  initForm() {
    this.profileForm = this.fb.group({
      email: [this.patient.data.email, [Validators.required, Validators.email]],
    });
  }

  updateEmail() {
    if (this.profileForm.valid) {
      const updatedEmail = this.profileForm.value.email;
      this.userService.updateEmail(this.patient.data.id, updatedEmail).subscribe({
        next: (response) => {
          alert('Email updated successfully');
          this.patient.data.email = updatedEmail;
        },
        error: (error) => {
          alert('Error updating email');
          console.error(error);
        }
      });
    }
  }

  
      
  openProfilePictureDialog() {
    const dialogRef = this.dialog.open(ProfilePictureDialogComponent, {
      width: '400px',
      data: { profilePicture: this.patient.data.profilePicture }
    });

    dialogRef.afterClosed().subscribe((newProfilePicture) => {
      if (newProfilePicture) {
        this.userService.updateProfilePicture(this.patient.data.id.toString(), newProfilePicture).subscribe({
          next: () => {
            this.patient.data.profilePicture = newProfilePicture; 
          },
          error: (error) => {
            console.error('Error updating profile picture', error);
          }
        });
      }
    });
  }

  
}
