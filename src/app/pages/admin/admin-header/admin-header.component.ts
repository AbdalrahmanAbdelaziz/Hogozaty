import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { LoginResponse } from '../../../shared/models/login-response';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit {
  patient!: LoginResponse;
  menuOpen = false;

  constructor(private userService: UserService, private router: Router) {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });
  }

  ngOnInit(): void {}

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

 
}
