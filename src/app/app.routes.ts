import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'adoptante',
    canActivate: [authGuard, () => roleGuard(['adoptante'])],
    loadComponent: () =>
      import('./pages/adoptante/adoptante.component').then(
        m => m.AdoptanteComponent
      )
  },
  {
    path: 'organizacion',
    canActivate: [authGuard, () => roleGuard(['organizacion'])],
    loadComponent: () =>
      import('./pages/organizacion/organizacion.component').then(
        m => m.OrganizacionComponent
      )
  },
  {
    path: 'administrador',
    canActivate: [authGuard, () => roleGuard(['administrador'])],
    loadComponent: () =>
      import('./pages/administrador/administrador.component').then(
        m => m.AdministradorComponent
      )
  }
];