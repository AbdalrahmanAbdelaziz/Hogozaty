import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-info',
  imports: [RouterModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent implements OnInit{




  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.showSectionsImmediately();
  }

  private showSectionsImmediately() {
    const sections = this.el.nativeElement.querySelectorAll('.section, .fade-in, .zoom-in');
    sections.forEach((section: HTMLElement) => {
      section.classList.add('show');
    });
  }
}

  // sections: HTMLElement[] = [];

  // constructor() {}

  // ngOnInit(): void {
  //   // Collect all sections you want to animate
  //   this.sections = Array.from(document.querySelectorAll('.section'));
  //   this.checkSectionVisibility();
  // }

  // @HostListener('window:scroll', [])
  // onScroll(): void {
  //   this.checkSectionVisibility();
  // }

  // checkSectionVisibility(): void {
  //   const windowHeight = window.innerHeight;
  //   this.sections.forEach((section) => {
  //     const sectionTop = section.getBoundingClientRect().top;

  //     if (sectionTop <= windowHeight * 0.75) {
  //       section.classList.add('show');
  //     } else {
  //       section.classList.remove('show');
  //     }
  //   });
  // }
// }
