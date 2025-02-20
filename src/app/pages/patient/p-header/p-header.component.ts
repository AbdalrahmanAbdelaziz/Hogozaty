import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { LoginResponse } from '../../../shared/models/login-response';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-p-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './p-header.component.html',
  styleUrl: './p-header.component.css'
})
export class PHeaderComponent implements OnInit {
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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}