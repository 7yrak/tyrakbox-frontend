import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BoxComponent } from './features/dashboard/box/box.component';
import { TrashComponent } from './features/dashboard/trash/trash.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'box',
    component: BoxComponent,
    children: [
      { path: '**', component: BoxComponent }
    ]
  },
  { path: 'trash', component: TrashComponent },
];
