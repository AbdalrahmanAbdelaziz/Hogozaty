import { Routes } from '@angular/router';
import { LandComponent } from './pages/land/land.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { InfoComponent } from './pages/info/info.component';
import { DHomeComponent } from './pages/doctor/d-home/d-home.component';
import { SHomeComponent } from './pages/secretary/s-home/s-home.component';
import { PHomeComponent } from './pages/patient/p-home/p-home.component';
import { ChooseAppointmentComponent } from './pages/patient/choose-appointment/choose-appointment.component';
import { SelectSpecializationComponent } from './pages/patient/select-specialization/select-specialization.component';
import { ViewDoctorProfileComponent } from './pages/patient/view-doctor-profile/view-doctor-profile.component';
import { ConfirmBookingComponent } from './pages/patient/confirm-booking/confirm-booking.component';
import { DoctorAppointmentsComponent } from './pages/patient/doctor-appointments/doctor-appointments.component';
import { DayAppointmentsComponent } from './pages/patient/day-appointments/day-appointments.component';
import { FilteredDoctorsComponent } from './pages/patient/filtered-doctors/filtered-doctors.component';
import { PProfileComponent } from './pages/patient/p-profile/p-profile.component';



export const routes: Routes = [
    { path: '', component:LandComponent},
    { path: 'info', component:InfoComponent},
    { path: 'login', component:LoginComponent},
    { path: 'register', component:RegisterComponent},
    { path: 'doctor-home', component: DHomeComponent},
    { path: 'secretary-home', component:SHomeComponent},
    { path: 'patient-home', component: PHomeComponent},
    { path: 'choose-appointment', component: ChooseAppointmentComponent},
    { path: 'select-specialization/:specialization', component: SelectSpecializationComponent },
    { path: 'view-doctor-profile/:id/:specializationId', component: ViewDoctorProfileComponent },
    { path: 'doctor-appointments/:docId/:specializationId', component: DoctorAppointmentsComponent },
    {path: 'appointments/:doctorId/:specializationId/:date', component: DayAppointmentsComponent},
    { path: 'confirm-booking', component: ConfirmBookingComponent},
    { path: 'filtered-doctors', component: FilteredDoctorsComponent},
    { path: 'p-profile', component:PProfileComponent},



    { path: '**', redirectTo:'', pathMatch: 'full'},
];
