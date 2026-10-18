import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { toEmbedUrl, toEmbedUrlByPattern } from './embed-url';
import { LabM33VideoEmbed, type EmbedResolver } from './video-embed';

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
const VIMEO = 'https://vimeo.com/76979871';
const VIMEO_EMBED = 'https://player.vimeo.com/video/76979871';
const LOOK_ALIKES = [
  'https://www.youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com@evil.test/watch?v=dQw4w9WgXcQ',
  'https://evil.test/?u=https://youtu.be/dQw4w9WgXcQ',
  'https://notyoutu.be/dQw4w9WgXcQ',
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'javascript:window.__m33Hits=1',
];

/** Renders the component for one input and returns its host element. */
function render(resolve: EmbedResolver, url: string): HTMLElement {
  const fixture = TestBed.createComponent(LabM33VideoEmbed);
  fixture.componentRef.setInput('resolve', resolve);
  fixture.componentRef.setInput('url', url);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe.each([
  { variant: 'parse with URL', resolve: toEmbedUrl },
  { variant: 'one pattern per provider', resolve: toEmbedUrlByPattern },
])('Exercise 33.1: a safe video embed ($variant)', ({ resolve }) => {
  afterEach(() => vi.restoreAllMocks());

  it('embeds a YouTube watch URL as its canonical embed URL', () => {
    expect(render(resolve, YOUTUBE).querySelector('iframe')?.getAttribute('src')).toBe(YOUTUBE_EMBED);
    expect(render(resolve, 'https://youtu.be/dQw4w9WgXcQ').querySelector('iframe')?.getAttribute('src')).toBe(YOUTUBE_EMBED);
  });

  it('embeds a Vimeo URL as its canonical player URL', () => {
    expect(render(resolve, VIMEO).querySelector('iframe')?.getAttribute('src')).toBe(VIMEO_EMBED);
  });

  it('renders a plain link for a host outside the allowlist', () => {
    const host = render(resolve, 'https://example.test/clip');

    expect(host.querySelector('iframe')).toBeNull();
    expect(host.querySelector('a')?.getAttribute('href')).toBe('https://example.test/clip');
  });

  it('refuses look-alike hosts and javascript: URLs', () => {
    for (const input of LOOK_ALIKES) {
      const host = render(resolve, input);

      expect(resolve(input), input).toBeNull();
      expect(host.querySelector('iframe'), input).toBeNull();
      expect(host.querySelector('a')?.getAttribute('href'), input).not.toMatch(/^javascript:/i);
    }
  });

  it('passes only built URLs to bypassSecurityTrustResourceUrl', () => {
    const bypass = vi.spyOn(TestBed.inject(DomSanitizer), 'bypassSecurityTrustResourceUrl');
    for (const input of [YOUTUBE, VIMEO, ...LOOK_ALIKES]) render(resolve, input);

    expect(bypass.mock.calls.map(([value]) => value)).toEqual([YOUTUBE_EMBED, VIMEO_EMBED]);
  });
});
