import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${this.resolveApiBaseUrl()}`;

  private resolveApiBaseUrl(): string {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:8083/api`;
    }

    return `${environment.apiUrl}`;
  }

  uploadFile(file: any, folderId?: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const req = new HttpRequest('POST', `${this.apiUrl}/files/upload`, formData, {
      reportProgress: true,
    });

    return this.http.request(req);
  }

  uploadChunk(chunk: Blob, chunkNumber: number, totalChunks: number, identifier: string): Observable<any> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('identifier', identifier);
    return this.http.post(`${this.apiUrl}/chunk/upload`, formData);
  }

  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/download/${fileId}`, {
      responseType: 'blob'
    });
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/files/${fileId}`);
  }
}
