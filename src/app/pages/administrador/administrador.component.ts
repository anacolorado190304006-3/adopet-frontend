import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminUser,
  AdminUserService
} from '../../services/admin-user.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class AdministradorComponent implements OnInit {
  private auth = inject(AuthService);
  private adminUserService = inject(AdminUserService);
  
  filterRole: 'todos' | 'organizacion' | 'adoptante' = 'todos';

  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];

  search = '';
  loading = true;
  showUserMenu = false;
  selectedUser: AdminUser | null = null;
  showUserModal = false;
  editingUser = false;
  showSuccessModal = false;
  successMessage = '';

  showCreateModal = false;
  creatingUser = false;

  newUser = {
    name: '',
    email: '',
    password: '',
    identification: '',
    role: 'adoptante' as 'administrador' | 'organizacion' | 'adoptante'
  };

  isOrganization(user: AdminUser | null): boolean {
    return user?.user_metadata?.role === 'organizacion';
  }

  get organizationCount(): number {
    return this.users.filter(
      user => this.getRole(user) === 'Organización'
    ).length;
  }

  get adopterCount(): number {
    return this.users.filter(
      user => this.getRole(user) === 'Adoptante'
    ).length;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.loading = true;

      this.users = await this.adminUserService.getUsers();
      this.filteredUsers = this.users;

    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      this.loading = false;
    }
  }

  filterUsers(): void {
    const value = this.search.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {

      const matchesSearch =
        user.email?.toLowerCase().includes(value) ||
        user.name?.toLowerCase().includes(value) ||
        user.user_id?.toLowerCase().includes(value);

      const role = user.user_metadata?.role;

      const matchesRole =
        this.filterRole === 'todos' ||
        role === this.filterRole;

      return matchesSearch && matchesRole;
    });
  }

  setFilter(role: 'todos' | 'organizacion' | 'adoptante'): void {
    this.filterRole = role;
    this.filterUsers();
  }

  getRole(user: AdminUser): string {
    const role = user.user_metadata?.role;

    if (role === 'organizacion') {
      return 'Organización';
    }

    if (role === 'adoptante') {
      return 'Adoptante';
    }

    if (role === 'administrador') {
      return 'Administrador';
    }

    return 'Sin asignar';
  }

  async deleteUser(user: AdminUser): Promise<void> {

    if (user.user_id === 'auth0|6aa76fa9ab38116cd1c9ca11') {
      alert('No puedes eliminar al administrador principal.');
      return;
    }

    const confirmed = confirm(
      `¿Eliminar a ${user.name || user.email}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await this.adminUserService.deleteUser(user.user_id);

      await this.loadUsers();

    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el usuario.');
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  openUser(user: AdminUser): void {
    this.selectedUser = { ...user };
    this.showUserModal = true;
    this.editingUser = false;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.editingUser = false;
  }

  startEditing(): void {
    this.editingUser = true;
  }

  cancelEditing(): void {
    if (this.selectedUser) {
      const original = this.users.find(
        user => user.user_id === this.selectedUser?.user_id
      );

      if (original) {
        this.selectedUser = { ...original };
      }
    }

    this.editingUser = false;
  }

  async saveUser(): Promise<void> {
    if (!this.selectedUser) return;

    try {
      const updated = await this.adminUserService.updateUser(
        this.selectedUser.user_id,
        {
          user_metadata: this.selectedUser.user_metadata
        }
      );

      const index = this.users.findIndex(
        user => user.user_id === updated.user_id
      );

      if (index !== -1) {
        this.users[index] = updated;
      }

      this.filterUsers();
      this.closeUserModal();

      this.successMessage =
        'Los datos de la organización fueron actualizados correctamente.';

      this.showSuccessModal = true;

    } catch (error) {
      console.error(error);

      this.successMessage =
        'No se pudieron actualizar los datos de la organización.';

      this.showSuccessModal = true;
    }
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newUser = {
      name: '',
      email: '',
      password: '',
      identification: '',
      role: 'adoptante'
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  async createUser(): Promise<void> {
    try {
      this.creatingUser = true;

      const created = await this.adminUserService.createUser(
        this.newUser
      );

      this.users.unshift(created);
      this.filterUsers();

      this.closeCreateModal();

      this.successMessage = 'El usuario fue creado correctamente.';
      this.showSuccessModal = true;

    } catch (error: any) {
      console.error(error);

      this.successMessage =
        error.message || 'No se pudo crear el usuario.';

      this.showSuccessModal = true;

    } finally {
      this.creatingUser = false;
    }
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  getOrganizationPhone(): string {
    return this.selectedUser?.user_metadata?.phoneOrg?.number || '';
  }

  setOrganizationPhone(value: string): void {
    if (!this.selectedUser) return;

    if (!this.selectedUser.user_metadata) {
      this.selectedUser.user_metadata = {};
    }

    if (!this.selectedUser.user_metadata.phoneOrg) {
      this.selectedUser.user_metadata.phoneOrg = {};
    }

    this.selectedUser.user_metadata.phoneOrg.number = value;
  }

  logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
}