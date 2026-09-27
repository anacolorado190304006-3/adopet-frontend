import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),

    provideAuth0({
      domain: 'dev-8hr3d7mi5f0134xd.us.auth0.com',
      clientId: '90e5elKWQTgT5MGug0lZZVI7GbDesnGs',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200',
        audience: 'https://api.adopet.com'
      }
    })
  ]
};
