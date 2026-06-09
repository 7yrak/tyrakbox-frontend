import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${this.resolveApiBaseUrl()}/auth`;

  private resolveApiBaseUrl(): string {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:8083/api`;
    }

    return `${environment.apiUrl}`;
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.setToken(response.token);
        this.setUsername(response.username);
        this.setFirstName(response.firstName);
        this.setLastName(response.lastName);
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, payload);
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tyrak_token', token);
    }
  }

  setUsername(username: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tyrak_username', username);
    }
  }

  setFirstName(firstName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tyrak_first_name', firstName);
    }
  }

  setLastName(lastName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tyrak_last_name', lastName);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('tyrak_token');
    }
    return null;
  }

  getUsername(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('tyrak_username');
    }
    return null;
  }

  getFirstName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('tyrak_first_name');
    }
    return null;
  }

  getLastName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('tyrak_last_name');
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tyrak_token');
      localStorage.removeItem('tyrak_username');
      localStorage.removeItem('tyrak_first_name');
      localStorage.removeItem('tyrak_last_name');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
