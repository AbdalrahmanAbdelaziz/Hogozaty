import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Router
    provideRouter(routes),

    // HttpClient
    provideHttpClient(),

    // Animations
    provideAnimations(),

    // Toastr (for notifications)
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      })
    ),

    // Angular Material Modules
    importProvidersFrom(MatFormFieldModule),
    importProvidersFrom(MatInputModule),
    importProvidersFrom(MatButtonModule),
    importProvidersFrom(MatDialogModule),
    importProvidersFrom(MatCardModule),
    importProvidersFrom(MatIconModule),
    importProvidersFrom(MatGridListModule),

    // Forms
    importProvidersFrom(FormsModule),

    // NgxCharts
    importProvidersFrom(NgxChartsModule),

    // NgBootstrap
    importProvidersFrom(NgbModule),
  ],
}).catch((err) => console.error(err));