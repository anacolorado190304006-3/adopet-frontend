import { Injectable, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

export interface CurrentUser {
  identification: string;
  name: string;
  mail: string;
  rol_id: number;
  rol: string;
  auth0_user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private auth = inject(AuthService);

  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      const token = await this.auth.getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://api.adopet.com'
        }
      }).toPromise();

      const response = await fetch('http://localhost:3000/api/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();

    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }


  async syncUser(): Promise<void> {
    const token = await this.auth.getAccessTokenSilently({
        authorizationParams: {
        audience: 'https://api.adopet.com'
        }
    }).toPromise();

    const response = await fetch(
        'http://localhost:3000/api/me/sync',
        {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('Error del backend:', data);
        throw new Error(data.message || 'Error sincronizando usuario');
    }

    console.log('SYNC:', data);
   }
}