import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { toEmbedUrl } from './embed-url';

/** Turns pasted text into a built embed URL, or null. */
export type EmbedResolver = (input: string) => string | null;

@Component({
  selector: 'lab-m33-video-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (embed(); as src) {
      <iframe title="Video" [src]="src" allowfullscreen></iframe>
    } @else {
      <a [href]="url()" rel="noopener noreferrer">{{ url() }}</a>
    }
  `,
})
export class LabM33VideoEmbed {
  readonly url = input.required<string>();
  readonly resolve = input<EmbedResolver>(toEmbedUrl);

  private readonly sanitizer = inject(DomSanitizer);

  /** The only place that trusts a value: it receives a built URL, never the input. */
  protected readonly embed = computed(() => {
    const built = this.resolve()(this.url());
    return built === null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(built);
  });
}
