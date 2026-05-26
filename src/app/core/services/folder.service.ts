import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface File {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface FolderContent {
    folders: Folder[];
    files: File[];
}


@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/folders`;

  getFolderContent(parentId?: string): Observable<FolderContent> {
      const url = parentId ? `${this.apiUrl}/content?parentId=${parentId}` : `${this.apiUrl}/content`;
      return this.http.get<FolderContent>(url);
  }

  createFolder(name: string, parentId?: string): Observable<Folder> {
    const body = { name, parentId: parentId || null };
    return this.http.post<Folder>(this.apiUrl, body);
  }

  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${folderId}`);
  }
}
