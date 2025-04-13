import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-type-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './user-type-modal.component.html',
  styleUrls: ['./user-type-modal.component.css']
})
export class UserTypeModalComponent {
  options = [
    {
      title: 'Doctor',
      icon: 'medical_services',
      description: 'Create a new doctor account',
      route: 'new-doctor',
      color: '#3f51b5'
    },
    {
      title: 'Secretary',
      icon: 'admin_panel_settings',
      description: 'Create a new secretary account',
      route: 'new-secretary',
      color: '#2196f3'
    }
  ];

  constructor(private dialogRef: MatDialogRef<UserTypeModalComponent>) {}

  selectOption(route: string): void {
    this.dialogRef.close({ route });
  }

  close(): void {
    this.dialogRef.close();
  }
}