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
import { PhoneReserveComponent } from './pages/secretary/phone-reserve/phone-reserve.component';
import { NewPatientComponent } from './pages/secretary/new-patient/new-patient.component';
import { CompleteDataComponent } from './pages/patient/complete-data/complete-data.component';
import { NewPatientAddPhoneComponent } from './pages/secretary/new-patient-add-phone/new-patient-add-phone.component';
import { MyAppointmentComponent } from './pages/secretary/my-appointment/my-appointment.component';
import { WalkInComponent } from './pages/secretary/walk-in/walk-in.component';
import { TimeSlotMangeComponent } from './pages/secretary/time-slot-mange/time-slot-mange.component';
import { ServiceSettingComponent } from './pages/secretary/service-setting/service-setting.component';
import { PatientsComponent } from './pages/secretary/patients/patients.component';
import { RevenueComponent } from './pages/secretary/revenue/revenue.component';
import { DoctorAppointmentsReschedualComponent } from './pages/doctor-appointments-reschedual/doctor-appointments-reschedual.component';
import { DayAppointmentsReschedualComponent } from './pages/day-appointments-reschedual/day-appointments-reschedual.component';
import { ConfirmReschedualComponent } from './pages/confirm-reschedual/confirm-reschedual.component';
import { SecDocAppComponent } from './pages/secretary/sec-doc-app/sec-doc-app.component';
import { SecDayAppComponent } from './pages/secretary/sec-day-app/sec-day-app.component';
import { SecConfirmAppComponent } from './pages/secretary/sec-confirm-app/sec-confirm-app.component';
import { SProfileComponent } from './pages/secretary/s-profile/s-profile.component';
import { DProfileComponent } from './pages/doctor/d-profile/d-profile.component';
import { DRevenueComponent } from './pages/doctor/d-revenue/d-revenue.component';
import { DMyApointmentsComponent } from './pages/doctor/d-my-apointments/d-my-apointments.component';
import { DTimeslotManagementComponent } from './pages/doctor/d-timeslot-management/d-timeslot-management.component';
import { DServiceSettingsComponent } from './pages/doctor/d-service-settings/d-service-settings.component';
import { DDailyReportComponent } from './pages/doctor/d-daily-report/d-daily-report.component';
import { SecDocAppResComponent } from './pages/secretary/sec-doc-app-res/sec-doc-app-res.component';
import { SecDocDayResComponent } from './pages/secretary/sec-doc-day-res/sec-doc-day-res.component';
import { DPatientsComponent } from './pages/doctor/d-patients/d-patients.component';
import { DViewPpComponent } from './pages/doctor/d-view-pp/d-view-pp.component';




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
    { path: 'phone-reserve', component: PhoneReserveComponent},
    { path: 'new-patient', component: NewPatientComponent},
    { path: 'add-patient-phone', component: NewPatientAddPhoneComponent},
    { path: 'doctor-appointments/:docId/:specializationId/:patientId', component: DoctorAppointmentsComponent },
    { path: 'complete-data', component: CompleteDataComponent},
    { path: 'my-appointment', component: MyAppointmentComponent},
    { path: 'walkin-reserve', component: WalkInComponent},
    { path: 'timeslot-management', component: TimeSlotMangeComponent},
    { path: 'service-settings', component: ServiceSettingComponent},
    { path: 'patients', component: PatientsComponent },
    { path: 'revenues', component: RevenueComponent},
    { path: 'doctor-appointments-reschedual/:docId/:specializationId/:patientId?', component: DoctorAppointmentsReschedualComponent },
    { path: 'appointments-reschedual/:doctorId/:specializationId/:date', component: DayAppointmentsReschedualComponent},
    { path: 'confirm-reschedual', component: ConfirmReschedualComponent},

    { path: 'sec-doctor-appointments/:docId/:patientId', component: SecDocAppComponent },
    { path: 'sec-doctor-appointments', component: SecDocAppComponent },
    { path: 'sec-doctor-appointments/:docId/:specializationId', component: SecDocAppComponent },
    { path: 'sec-appointments/:doctorId/:date', component: SecDayAppComponent},    
    { path: 'sec-confirm-booking', component: SecConfirmAppComponent},

    {path: 's-profile', component: SProfileComponent},
    { path: 'd-profile', component: DProfileComponent},
    { path: 'd-revenues', component: DRevenueComponent},
    { path: 'd-my-apointments', component: DMyApointmentsComponent},
    { path: 'd-timeslot-management', component: DTimeslotManagementComponent},
    { path: 'd-service-settings', component: DServiceSettingsComponent},
    { path: 'd-daily-report', component: DDailyReportComponent},
    { path: 'd-patients', component: DPatientsComponent},


    { path: 'doctor-appointments', component: DoctorAppointmentsComponent },

    { path: 'appointments/:docId/:selectedDate', component: DayAppointmentsComponent },

    { path: 'sec-doctor-appointments-reschedual/:docId/:specializationId/:patientId?', component: SecDocAppResComponent },

    { path: 'sec-appointments-reschedual/:doctorId/:specializationId/:date', component: SecDocDayResComponent},

    { path: 'd-view-pp',component: DViewPpComponent},



    // { path: '**', redirectTo:'', pathMatch: 'full'},
];
