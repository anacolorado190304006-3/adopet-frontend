import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  loading = true;

  ngOnInit(): void {
    this.auth.isAuthenticated$.subscribe(async (isAuthenticated) => {
      if (!isAuthenticated) return;

      console.log('✅ Auth0 autenticado');

      // Sincronizar usuario con PostgreSQL, pero NO bloquear el login
      try {
        await this.userService.syncUser();
        console.log('✅ Usuario sincronizado con PostgreSQL');
      } catch (error) {
        console.error('⚠️ Error sincronizando usuario:', error);
      }

      // Obtener usuario desde PostgreSQL
      const user = await this.userService.getCurrentUser();

      console.log('🐾 USUARIO:', user);

      if (!user) {
        console.error('❌ No se pudo obtener el usuario');
        return;
      }

      console.log('🎯 ROL:', user.rol);

      switch (user.rol) {
        case 'administrador':
          console.log('➡️ ADMIN');
          await this.router.navigateByUrl('/administrador');
          break;

        case 'organizacion':
          console.log('➡️ ORGANIZACIÓN');
          await this.router.navigateByUrl('/organizacion');
          break;

        case 'adoptante':
          console.log('➡️ ADOPTANTE');
          await this.router.navigateByUrl('/adoptante');
          break;

        default:
          console.error('❌ Rol no reconocido:', user.rol);
      }
    });
  }
}