import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'adoptante',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/adoptante/adoptante.component').then(
        m => m.AdoptanteComponent
      )
  },

  {
    path: 'organizacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/organizacion/organizacion.component').then(
        m => m.OrganizacionComponent
      )
  },
  {
    path: 'administrador',
    loadComponent: () =>
        import('./pages/administrador/administrador.component').then(
            m => m.AdministradorComponent
        )
    }

];