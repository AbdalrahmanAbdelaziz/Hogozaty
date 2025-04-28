import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-land',
  standalone: true,
  imports: [RouterModule, TranslocoModule],
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.css']
})
export class LandComponent implements OnInit{
  currentLang: string;

  constructor(private translocoService: TranslocoService) {
    this.currentLang = translocoService.getActiveLang();
  }

ngOnInit() {
  const browserLang = navigator.language.substring(0, 2);
  const supportedLangs = ['en', 'ar'];
  const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
  
  this.currentLang = defaultLang;
  this.translocoService.setActiveLang(defaultLang);
  document.documentElement.lang = defaultLang;
  document.documentElement.dir = defaultLang === 'ar' ? 'rtl' : 'ltr';
}

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}