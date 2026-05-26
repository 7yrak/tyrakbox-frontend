import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BoxComponent } from './features/dashboard/box/box.component';
import { TrashComponent } from './features/dashboard/trash/trash.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'box', component: BoxComponent },
      { path: 'trash', component: TrashComponent },
      // Redirección por defecto para rutas protegidas
      { path: '', redirectTo: 'box', pathMatch: 'full' }
    ]
  },
  // Redirección para cualquier otra ruta no encontrada
  { path: '**', redirectTo: 'login' }
];
