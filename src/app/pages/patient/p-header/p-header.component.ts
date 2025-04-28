import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { LoginResponse } from '../../../shared/models/login-response';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-p-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule],
  templateUrl: './p-header.component.html',
  styleUrls: ['./p-header.component.css']
})
export class PHeaderComponent implements OnInit, OnDestroy {
  patient!: LoginResponse;
  menuOpen = false;
  isDarkMode = false;
  currentLang: string = 'en';
  private darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(
    private userService: UserService, 
    private router: Router,
    private renderer: Renderer2,
    private translocoService: TranslocoService
  ) {
    this.userService.userObservable.subscribe((newUser) => {
      if (newUser) {
        this.patient = newUser;
      }
    });
  }

  ngOnInit(): void {
    // Initialize language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLang = savedLang;
    this.translocoService.setActiveLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

    // Initialize dark mode
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    this.applyDarkMode();

    if (!localStorage.getItem('darkMode')) {
      this.darkModeMediaQuery.addEventListener('change', this.systemThemeChanged);
    }
  }

  ngOnDestroy(): void {
    this.darkModeMediaQuery.removeEventListener('change', this.systemThemeChanged);
  }

  private systemThemeChanged = (e: MediaQueryListEvent) => {
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