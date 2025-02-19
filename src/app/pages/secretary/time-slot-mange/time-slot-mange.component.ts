import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-time-slot-mange',
 imports: [
     CommonModule,
     RouterModule,
     FormsModule,
     SHeaderComponent,
     SideNavbarComponent,
     ReactiveFormsModule
   ],
  templateUrl: './time-slot-mange.component.html',
  styleUrl: './time-slot-mange.component.css'
})
export class TimeSlotMangeComponent implements OnInit {

  timeSlotForm!: FormGroup;
  weekDays: { day: string, date: string }[] = [];

  constructor(private fb: FormBuilder, private doctorService: DoctorService) { }

  ngOnInit(): void {
    this.generateWeekDays();

    // Initialize form
    this.timeSlotForm = this.fb.group({
      selectedDay: [null, Validators.required],
      workingFrom: ['', Validators.required],  // 00:00:00 format
      workingTo: ['', Validators.required],
      slotInterval: [null, [Validators.required, Validators.min(1)]], // Default 15 mins
      repeatWeeks: [null, [Validators.required, Validators.min(1)]], // Default 1 week
    });
  }

  // Generate the next 7 days dynamically
  generateWeekDays() {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      this.weekDays.push({
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: date.toISOString().split('T')[0] // Format YYYY-MM-DD
      });
    }
  }

  // Submit form data
  onSubmit() {
    if (this.timeSlotForm.valid) {
      this.doctorService.createTimeSlot(this.timeSlotForm.value).subscribe({
        next: (response) => console.log('Time Slot Created Successfully', response),
        error: (error) => console.error('Error:', error),
      });
    }
}
}
