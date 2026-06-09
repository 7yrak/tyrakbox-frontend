import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <h2>Mi perfil</h2>
        <p class="subtitle">{{ fullName }} · {{ username }}</p>

        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <div class="form-group">
            <label>Contraseña actual</label>
            <input type="password" formControlName="currentPassword" class="form-control">
          </div>

          <div class="form-group">
            <label>Nueva contraseña</label>
            <input type="password" formControlName="newPassword" class="form-control">
          </div>

          <div class="actions">
            <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || isLoading">
              {{ isLoading ? 'Guardando...' : 'Cambiar contraseña' }}
            </button>
          </div>

          <p class="message success" *ngIf="successMessage">{{ successMessage }}</p>
          <p class="message error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 720px; margin: 0 auto; }
    .profile-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem; }
    .subtitle { color: var(--text-secondary); margin-bottom: 1rem; }
    .form-group { margin-bottom: 1rem; display: grid; gap: 0.4rem; }
    .form-control { width: 100%; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); }
    .actions { margin-top: 1rem; }
    .message { margin-top: 1rem; }
    .success { color: #2e7d32; }
    .error { color: #c62828; }
  `]
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  username = this.authService.getUsername() ?? '';
  fullName = `${this.authService.getFirstName() ?? ''} ${this.authService.getLastName() ?? ''}`.trim();

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(this.passwordForm.value as any).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'No se pudo cambiar la contraseña.';
        this.isLoading = false;
      }
    });
  }
}
