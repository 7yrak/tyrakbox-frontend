import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => this.setToken(response.token))
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  setToken(token: string): void {
    localStorage.setItem('tyrak_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('tyrak_token');
  }

  logout(): void {
    localStorage.removeItem('tyrak_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}