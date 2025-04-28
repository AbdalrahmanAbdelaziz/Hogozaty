import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatSnackBarModule,
    TranslocoModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitted = false;
  returnUrl = '';
  isDarkMode = false;
  currentLang: string = 'en';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      EmailOrUsernameOrPhone: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.currentLang = this.translocoService.getActiveLang();
    this.applyDarkModePreference();
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  get fc() {
    return this.loginForm.controls;
  }

  private applyDarkModePreference(): void {
    this.isDarkMode = false;
    this.renderer.removeClass(document.body, 'dark-mode');
    localStorage.removeItem('darkMode');
  }

  submit(): void {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      this.toastr.warning(
        this.translocoService.translate('login.formErrors.incompleteFields'),
        this.translocoService.translate('login.formErrors.warning')
      );
      return;
    }

    this.userService.login({
      EmailOrUsernameOrPhone: this.fc['EmailOrUsernameOrPhone'].value,
      password: this.fc['password'].value
    }).subscribe({
      next: (response) => {
        this.applyDarkModePreference();
        const userRole = response.data.applicationRole_En;
        
        if (userRole === 'Admin') {
          this.router.navigateByUrl('/admin-home');
        } else if (userRole === 'Doctor') {
          this.router.navigateByUrl('/doctor-home');
        } else if (userRole === 'Patient') {
          this.router.navigateByUrl('/patient-home');
        } else if (userRole === 'Secretary') {
          this.router.navigateByUrl('/secretary-home');
        } else {
          console.error('Unexpected user role:', userRole);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastr.error(
          this.translocoService.translate('login.errors.loginFailed'),
          this.translocoService.translate('login.errors.error')
        );
      }
    });
  }
}