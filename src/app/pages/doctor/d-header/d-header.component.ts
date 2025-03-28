import { Component, OnInit } from '@angular/core';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-d-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './d-header.component.html',
  styleUrl: './d-header.component.css'
})
export class DHeaderComponent implements OnInit {
  patient!: LoginResponse;
  menuOpen = false;

  constructor(private userService: UserService, private router: Router){
     this.userService.userObservable.subscribe((newUser) => {
       if(newUser) {
         this.patient = newUser;
       }
     });
   }

  ngOnInit(): void {
      
  }


  logout(){
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
