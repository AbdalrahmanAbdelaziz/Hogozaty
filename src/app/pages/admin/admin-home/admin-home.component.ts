import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { UserTypeModalComponent } from '../user-type-modal/user-type-modal.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    AdminHeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  gridColumns = 4;
  rowHeight = '300px';
  gutterSize = '20px';

  cards = [
    { 
      title: 'Users', 
      icon: 'people', 
      description: 'Manage all system users', 
      route: '/admin/users',
      color: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)'
    },
    { 
      title: 'New User', 
      icon: 'person_add', 
      description: 'Create a new user', 
      action: 'openUserTypeModal', 
      color: 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)'
    },
    { 
      title: 'Clinics', 
      icon: 'local_hospital', 
      description: 'View and manage all clinic', 
      route: '/clinics',
      color: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
    },
    { 
      title: 'New Clinic', 
      icon: 'add_business', 
      description: 'Register a new clinic', 
      route: '/create_clinic',
      color: 'linear-gradient(135deg, #8bc34a 0%, #cddc39 100%)'
    },
    { 
      title: 'Specializations', 
      icon: 'medical_services', 
      description: 'Manage all medical specializations', 
      route: '/admin/specializations',
      color: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
    },
    { 
      title: 'New Specialization', 
      icon: 'add_circle', 
      description: 'Add new medical specialization', 
      route: '/admin/new-specialization',
      color: 'linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%)'
    },
    { 
      title: 'Services', 
      icon: 'miscellaneous_services', 
      description: 'Manage all healthcare services', 
      route: '/admin/services',
      color: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)'
    },
    { 
      title: 'New Service', 
      icon: 'post_add', 
      description: 'Add new healthcare service', 
      route: '/admin/new-service',
      color: 'linear-gradient(135deg, #e91e63 0%, #f44336 100%)'
    }
  ];

  constructor(private router: Router,  private dialog: MatDialog) {}

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    const screenWidth = window.innerWidth;
    
    if (screenWidth >= 1400) {
      this.gridColumns = 4;
      this.rowHeight = '300px';
    } else if (screenWidth >= 1024) {
      this.gridColumns = 3;
      this.rowHeight = '320px';
    } else if (screenWidth >= 768) {
      this.gridColumns = 2;
      this.rowHeight = '340px';
    } else {
      this.gridColumns = 1;
      this.rowHeight = '360px';
    }
  }

  ngOnInit() {
    this.onResize();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  openUserTypeModal(): void {
    const dialogRef = this.dialog.open(UserTypeModalComponent, {
      width: '500px',
      panelClass: 'user-type-modal',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate([result.route]);
      }
    });
  }

  private actionMap: { [key: string]: () => void } = {
    openUserTypeModal: () => this.openUserTypeModal()
  };
  

  cardAction(card: any): void {
    if (card.action && this.actionMap[card.action]) {
      this.actionMap[card.action]();
    } else if (card.route) {
      this.navigateTo(card.route);
    }
  }
  
}