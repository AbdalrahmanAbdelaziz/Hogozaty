import { Component, OnInit } from '@angular/core';
import { LoginResponse } from '../../../shared/models/login-response';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-s-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './s-header.component.html',
  styleUrl: './s-header.component.css'
})
export class SHeaderComponent implements OnInit {
  patient!: LoginResponse;

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

}
