import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Folder, File } from '../../../core/services/folder.service';
import { TrashService } from '../../../core/services/trash.service';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.scss']
})
export class TrashComponent implements OnInit {
  private trashService = inject(TrashService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  folders: Folder[] = [];
  files: File[] = [];
  isLoading = true;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTrashContent();
    }
  }

  loadTrashContent() {
    this.isLoading = true;
    this.trashService.getTrashContent().subscribe(content => {
      this.folders = content.folders;
      this.files = content.files;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  emptyTrash() {
    if (confirm('¿Estás seguro de que quieres vaciar la papelera? Esta acción no se puede deshacer.')) {
      this.trashService.emptyTrash().subscribe(() => {
        this.folders = [];
        this.files = [];
        this.cdr.detectChanges();
      });
    }
  }

  restoreItem(item: File | Folder, type: 'file' | 'folder') {
    this.trashService.restoreItem(item.id, type).subscribe(() => {
      if (type === 'file') {
        this.files = this.files.filter(f => f.id !== item.id);
      } else {
        this.folders = this.folders.filter(f => f.id !== item.id);
      }
      this.cdr.detectChanges();
    });
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
