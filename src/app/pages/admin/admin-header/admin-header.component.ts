import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { LoginResponse } from '../../../shared/models/login-response';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-admin-header',
  imports: [CommonModule,RouterModule, TranslocoModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements  OnInit, OnDestroy {
  patient!: LoginResponse;
  menuOpen = false;
  isDarkMode = false;
  currentLang: string = 'en';
  private darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(private userService: UserService, private router: Router,private renderer: Renderer2, public translocoService: TranslocoService) {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });
  }

// In s-header.component.ts
ngOnInit(): void {
  const savedLang = localStorage.getItem('language') || 'en';
  this.currentLang = savedLang;
  this.translocoService.setActiveLang(savedLang);
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';


  const savedMode = localStorage.getItem('darkMode');
  this.isDarkMode = savedMode === 'true'; 
  this.applyDarkMode();

  // Listen for system color scheme changes only if no preference set
  if (!localStorage.getItem('darkMode')) {
      this.darkModeMediaQuery.addEventListener('change', this.systemThemeChanged);
  }
}

  ngOnDestroy(): void {
    this.darkModeMediaQuery.removeEventListener('change', this.systemThemeChanged);
  }

  private systemThemeChanged = (e: MediaQueryListEvent) => {
    // Only follow system preference if user hasn't set a preference
    if (!localStorage.getItem('darkMode')) {
      this.isDarkMode = e.matches;
      this.applyDarkMode();
    }
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.userService.setDarkModePreference(this.isDarkMode);
    this.applyDarkMode();
  }

  private applyDarkMode() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}