import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Signal,
  computed,
  createComponent,
  inject,
  inputBinding,
  isSignal,
  outputBinding,
  signal,
} from '@angular/core';
import { Toast } from './toast';

export interface ToastOptions {
  readonly content?: readonly Node[];
}

// Creates Toast components on elements of document.body and owns their whole life cycle.
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly live = signal<readonly ComponentRef<Toast>[]>([]);

  readonly count = computed(() => this.live().length);

  show(message: string | Signal<string>, options: ToastOptions = {}): void {
    const host = this.document.body.appendChild(this.document.createElement('lab-m19-toast'));
    const ref: ComponentRef<Toast> = createComponent(Toast, {
      environmentInjector: this.injector,
      hostElement: host,
      bindings: [
        inputBinding('message', () => (isSignal(message) ? message() : message)),
        outputBinding('dismissed', () => this.dismiss(ref)),
      ],
      projectableNodes: options.content ? [[...options.content]] : undefined,
    });
    this.appRef.attachView(ref.hostView);
    this.live.update((refs) => [...refs, ref]);
  }

  dismissAll(): void {
    [...this.live()].forEach((ref) => this.dismiss(ref));
  }

  private dismiss(ref: ComponentRef<Toast>): void {
    if (!this.live().includes(ref)) return;
    this.live.update((refs) => refs.filter((r) => r !== ref));
    ref.destroy();
  }
}
