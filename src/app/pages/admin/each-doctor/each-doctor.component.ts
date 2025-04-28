import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'app-each-doctor',
  imports: [CommonModule, AdminHeaderComponent],
  templateUrl: './each-doctor.component.html',
  styleUrl: './each-doctor.component.css'
})
export class EachDoctorComponent implements OnInit{

  constructor(){}

  ngOnInit(): void {
      
  }

}
