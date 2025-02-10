import { Routes } from '@angular/router';
import { LandComponent } from './pages/land/land.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { InfoComponent } from './pages/info/info.component';
import { DHomeComponent } from './pages/doctor/d-home/d-home.component';
import { SHomeComponent } from './pages/secretary/s-home/s-home.component';
import { PHomeComponent } from './pages/patient/p-home/p-home.component';

export const routes: Routes = [
    { path: '', component:LandComponent},
    { path: 'info', component:InfoComponent},
    { path: 'login', component:LoginComponent},
    { path: 'register', component:RegisterComponent},
    { path: 'doctor-home', component: DHomeComponent},
    { path: 'secretary-home', component:SHomeComponent},
    { path: 'patient-home', component: PHomeComponent},


    { path: '**', redirectTo:'', pathMatch: 'full'},
];
