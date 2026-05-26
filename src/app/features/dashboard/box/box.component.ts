import { Component, OnInit, inject, ChangeDetectorRef, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderService, Folder, File, FolderContent } from '../../../core/services/folder.service';
import { FileService } from '../../../core/services/file/file';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { from } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: any) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './box.component.html',
  styleUrls: ['./box.scss']
})
export class BoxComponent implements OnInit {
  private folderService = inject(FolderService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  // Permitir uso de Math en el template
  protected readonly Math = Math;

  folders: Folder[] = [];
  files: File[] = [];

  currentFolderId: string | undefined = undefined;
  navigationHistory: { id: string | undefined, name: string }[] = [{ id: undefined, name: 'Mi Unidad' }];

  isLoading = true;
  errorMessage = '';

  // Upload Status
  isUploading = false;
  currentUploadingFile = '';
  totalFilesToUpload = 0;
  uploadedFilesCount = 0;

  // Modal
  showNewFolderModal = false;
  newFolderName = '';
  isCreating = false;

  // Context Menu
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuItem: File | Folder | null = null;
  contextMenuItemType: 'file' | 'folder' | null = null;

  ngOnInit() {
    this.loadContent();
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  onDocumentClick() {
    if (this.contextMenuVisible) {
      this.contextMenuVisible = false;
      this.cdr.detectChanges();
    }
  }

  loadContent() {
    this.isLoading = true;
    this.folderService.getFolderContent(this.currentFolderId).subscribe({
      next: (data: FolderContent) => {
        this.folders = data.folders;
        this.files = data.files;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el contenido.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToFolder(folder: Folder) {
    this.currentFolderId = folder.id;
    this.navigationHistory.push({ id: folder.id, name: folder.name });
    this.loadContent();
  }

  navigateUp(index: number) {
     const target = this.navigationHistory[index];
     this.currentFolderId = target.id;
     this.navigationHistory = this.navigationHistory.slice(0, index + 1);
     this.loadContent();
  }

  openNewFolderModal() {
    this.newFolderName = '';
    this.showNewFolderModal = true;
  }

  closeNewFolderModal() {
    this.showNewFolderModal = false;
  }

  confirmCreateFolder() {
    if (this.newFolderName.trim()) {
      this.isCreating = true;
      this.folderService.createFolder(this.newFolderName.trim(), this.currentFolderId).subscribe({
        next: (newFolder: Folder) => {
          this.folders.push(newFolder);
          this.isCreating = false;
          this.closeNewFolderModal();
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Error al crear la carpeta.');
          this.isCreating = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      this.startSequentialUpload(files);
    }
    event.target.value = '';
  }

  onFolderSelected(event: any) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      this.startSequentialUpload(files);
    }
    event.target.value = '';
  }

  private startSequentialUpload(files: any[]) {
    this.isUploading = true;
    this.totalFilesToUpload = files.length;
    this.uploadedFilesCount = 0;

    from(files).pipe(
      concatMap(file => {
        this.currentUploadingFile = file.name;
        this.cdr.detectChanges();
        return this.fileService.uploadFile(file, this.currentFolderId);
      }),
      finalize(() => {
        this.isUploading = false;
        this.loadContent();
      })
    ).subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.uploadedFilesCount++;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error en subida secuencial:', err);
        alert('Hubo un error subiendo algunos archivos.');
      }
    });
  }

  getUploadPercentage(): number {
    if (this.totalFilesToUpload === 0) return 0;
    return Math.round((this.uploadedFilesCount / this.totalFilesToUpload) * 100);
  }

  downloadFile(file: File) {
      this.fileService.downloadFile(file.id).subscribe((blob: Blob) => {
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = file.name;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);
      });
  }

  formatSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onRightClick(event: MouseEvent, item: File | Folder, type: 'file' | 'folder') {
    event.preventDefault();
    this.contextMenuItem = item;
    this.contextMenuItemType = type;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuVisible = true;
    this.cdr.detectChanges();
  }

  deleteItem() {
    if (!this.contextMenuItem) return;
    const id = this.contextMenuItem.id;
    const obs = this.contextMenuItemType === 'file'
      ? this.fileService.deleteFile(id)
      : this.folderService.deleteFolder(id);

    obs.subscribe(() => {
      this.loadContent();
      this.cdr.detectChanges();
    });
  }

  getFileIcon(mimeType: string): { class: string, path: string } {
    if (mimeType.startsWith('image/')) return { class: 'image-icon', path: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>' };
    if (mimeType.startsWith('video/')) return { class: 'video-icon', path: '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>' };
    if (mimeType.startsWith('audio/')) return { class: 'audio-icon', path: '<path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21s4.5-2.01 4.5-4.5V6h4V3h-7z"></path>' };
    if (mimeType === 'application/pdf') return { class: 'pdf-icon', path: '<path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 4.5h-2v-3h-1.5v3h-2v-2c0-1.1.9-2 2-2h1.5v-1h-3V7h3v1.5h-1.5v1h1.5c1.1 0 2 .9 2 2v2z"></path>' };
    if (mimeType.includes('word')) return { class: 'doc-icon', path: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 14H7v-2h6v2zm0-4H7v-2h6v2zm-1-4V3.5L17.5 9H12z"></path>' };
    if (mimeType.includes('sheet')) return { class: 'sheet-icon', path: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 14H7v-2h6v2zm0-4H7v-2h6v2zm-1-4V3.5L17.5 9H12z"></path>' };
    if (mimeType.includes('presentation')) return { class: 'slide-icon', path: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 14H7v-2h6v2zm0-4H7v-2h6v2zm-1-4V3.5L17.5 9H12z"></path>' };
    if (mimeType.includes('zip') || mimeType.includes('rar')) return { class: 'archive-icon', path: '<path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path>' };
    return { class: 'default-icon', path: '<path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"></path>' };
  }
}
