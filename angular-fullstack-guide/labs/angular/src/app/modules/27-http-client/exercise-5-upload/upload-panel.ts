import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { UploadService, UploadState } from './upload.service';

@Component({
  selector: 'lab-m27-upload-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="status">{{ label() }}</p>
    <button type="button" class="cancel" [disabled]="!uploading()" (click)="cancel()">Cancel</button>
  `,
})
export class UploadPanel {
  private readonly upload = inject(UploadService);
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  private readonly state = signal<UploadState | null>(null);
  private readonly cancelled = signal(false);
  protected readonly uploading = signal(false);

  protected readonly label = computed(() => {
    const state = this.state();
    if (this.cancelled()) return 'Cancelled';
    if (!state) return this.uploading() ? '0%' : 'Choose a file';
    switch (state.kind) {
      case 'progress':
        return `${state.percent}%`;
      case 'done':
        return `Uploaded ${state.id}`;
      case 'failed':
        return 'Upload failed';
    }
  });

  /** Starts a new upload; one still running is aborted first. */
  start(file: Blob): void {
    this.subscription?.unsubscribe();
    this.state.set(null);
    this.cancelled.set(false);
    this.uploading.set(true);
    this.subscription = this.upload
      .upload(file)
      .pipe(
        finalize(() => this.uploading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => this.state.set(state));
  }

  /** Unsubscribing is the cancel: the XHR backend aborts the request. */
  cancel(): void {
    this.subscription?.unsubscribe();
    this.cancelled.set(true);
  }
}
