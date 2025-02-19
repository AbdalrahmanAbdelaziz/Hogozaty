import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SHeaderComponent } from '../s-header/s-header.component';
import { SideNavbarComponent } from '../../patient/side-navbar/side-navbar.component';

@Component({
  selector: 'app-phone-reserve',
 imports: [
    CommonModule,
    RouterModule,
    SHeaderComponent,
    SideNavbarComponent
  ],  
  templateUrl: './phone-reserve.component.html',
  styleUrl: './phone-reserve.component.css'
})
export class PhoneReserveComponent implements OnInit{

  constructor(){}

  ngOnInit(): void {
      
  }

}
