import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="main-layout">
      <app-sidebar></app-sidebar>
      <div class="content-wrapper">
        <header class="app-header">
          <div class="header-content">
            <!-- Espacio para futuras acciones o título -->
            <div class="header-title"></div>
            <div class="user-actions">
              <button class="btn-icon" (click)="logout()" title="Cerrar sesión">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      height: 100vh;
    }
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .app-header {
      height: 64px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      flex-shrink: 0;
    }
    .header-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-actions .btn-icon {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .user-actions .btn-icon:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
    main {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 2rem;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
