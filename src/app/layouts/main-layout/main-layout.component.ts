import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="main-layout">
      <app-sidebar></app-sidebar>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      height: 100vh;
    }
    main {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class MainLayoutComponent {}
