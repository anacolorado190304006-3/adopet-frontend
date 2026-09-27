import { Component, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  showRegisterOptions = false;

  login(): void {
    if (this.isBrowser) {
      this.auth.loginWithRedirect();
    }
  }

  openRegisterOptions(): void {
    this.showRegisterOptions = true;
  }

  closeRegisterOptions(): void {
    this.showRegisterOptions = false;
  }

  register(type: 'adoption' | 'organization'): void {
    if (this.isBrowser) {
      sessionStorage.setItem('signup_type', type);

      this.auth.loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          signup_type: type
        }
      });
    }
  }

  goToSection(sectionId: string): void {
    this.document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth' });
  }
}