import { Injectable, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

export interface AdminUser {
  user_id: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  created_at?: string;
  last_login?: string;
  logins_count?: number;
  user_metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private auth = inject(AuthService);

  private async getToken(): Promise<string> {
    return await this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.adopet.com'
      }
    }).toPromise() as string;
  }

  async getUsers(): Promise<AdminUser[]> {
    const token = await this.getToken();

    const response = await fetch(
      'http://localhost:3000/api/admin/users',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error obteniendo usuarios');
    }

    return await response.json();
  }

  async updateUser(userId: string, data: any): Promise<AdminUser> {
    const token = await this.getToken();

    const response = await fetch(
        `http://localhost:3000/api/admin/users/${encodeURIComponent(userId)}`,
        {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error('Error actualizando usuario');
    }

    const result = await response.json();

    return result.auth0User;
    }

  async deleteUser(userId: string): Promise<void> {

    const token = await this.getToken();

    const response = await fetch(
      `http://localhost:3000/api/admin/users/${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error eliminando usuario');
    }
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    identification: string;
    role: 'administrador' | 'organizacion' | 'adoptante';
    }): Promise<AdminUser> {

    const token = await this.getToken();

    const response = await fetch(
        'http://localhost:3000/api/admin/users',
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error creando usuario');
    }

    return result.auth0User;
    }
}