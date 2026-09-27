import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, from, catchError, of } from 'rxjs';

export const roleGuard = (allowedRoles: string[]) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return from(userService.getCurrentUser()).pipe(
    map(user => {
      if (user && allowedRoles.includes(user.rol)) {
        return true;
      }

      if (user) {
        return router.createUrlTree([`/${user.rol}`]);
      }

      return router.createUrlTree(['/']);
    }),
    catchError(() => of(router.createUrlTree(['/'])))
  );
};