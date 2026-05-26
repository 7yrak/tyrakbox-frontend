import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Folder, File } from './folder.service';

export interface TrashContent {
  folders: Folder[];
  files: File[];
}

@Injectable({
  providedIn: 'root'
})
export class TrashService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/trash`;

  getTrashContent(): Observable<TrashContent> {
    return this.http.get<TrashContent>(`${this.apiUrl}/content`);
  }

  emptyTrash(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/empty`);
  }

  restoreItem(id: string, type: 'file' | 'folder'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/restore/${id}?type=${type}`, {});
  }
}
