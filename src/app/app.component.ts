import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private userService = inject(UserService);
  private router = inject(Router);

  showRegisterOptions = false;

  login(): void {
    if (this.isBrowser && this.auth) {
      this.auth.loginWithRedirect();
    }
  }

    ngOnInit(): void {
    if (!this.isBrowser || !this.auth) {
      return;
    }

    this.auth.isAuthenticated$.subscribe(async (isAuthenticated) => {
      if (!isAuthenticated) {
        return;
      }

      const signupType = sessionStorage.getItem('signup_type');

      if (signupType === 'adoption' || signupType === 'organization') {
        console.log('Registro detectado:', signupType);

        try {
          await this.userService.syncUser();

          sessionStorage.removeItem('signup_type');

          console.log('Usuario sincronizado correctamente');
        } catch (error) {
          console.error('Error sincronizando usuario:', error);
          return;
        }
      }

      const user = await this.userService.getCurrentUser();

      if (!user) {
        return;
      }

      switch (user.rol) {
        case 'adoptante':
          await this.router.navigate(['/adoptante']);
          break;

        case 'organizacion':
          await this.router.navigate(['/organizacion']);
          break;

        case 'administrador':
          await this.router.navigate(['/administrador']);
          break;

        default:
          console.error('Rol no reconocido:', user.rol);
      }
    });
  }

  async loadCurrentUser(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    console.log('🐾 USUARIO DESDE SERVICIO:', user);
  }

  openRegisterOptions(): void {
    this.showRegisterOptions = true;
  }

  closeRegisterOptions(): void {
    this.showRegisterOptions = false;
  }

  register(type: 'adoption' | 'organization'): void {
    if (this.isBrowser && this.auth) {
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