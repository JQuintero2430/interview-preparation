const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^[0-9]{1,12}$/;

/** Builds the embed URL for a YouTube id. */
const youtubeEmbed = (id: string): string => `https://www.youtube-nocookie.com/embed/${id}`;

/** Builds the player URL for a Vimeo id. */
const vimeoEmbed = (id: string): string => `https://player.vimeo.com/video/${id}`;

/** Takes the id out of a parsed URL, or null when the host is not on the allowlist. */
function idFromUrl(url: URL): { id: string; build: (id: string) => string } | null {
  switch (url.hostname) {
    case 'www.youtube.com':
      return url.pathname === '/watch' ? { id: url.searchParams.get('v') ?? '', build: youtubeEmbed } : null;
    case 'youtu.be':
      return { id: url.pathname.slice(1), build: youtubeEmbed };
    case 'vimeo.com':
      return { id: url.pathname.slice(1), build: vimeoEmbed };
    default:
      return null;
  }
}

/** Solution: parse with `URL`, compare the host exactly, check the id's shape, then build. */
export function toEmbedUrl(input: string): string | null {
  const url = URL.parse(input);
  if (url === null || url.protocol !== 'https:' || url.username !== '' || url.password !== '') return null;
  const parts = idFromUrl(url);
  if (parts === null) return null;
  const shape = parts.build === youtubeEmbed ? YOUTUBE_ID : VIMEO_ID;
  return shape.test(parts.id) ? parts.build(parts.id) : null;
}

const YOUTUBE_URL = /^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})$/;
const VIMEO_URL = /^https:\/\/vimeo\.com\/([0-9]{1,12})$/;

/** Alternative: one anchored regular expression per provider, applied to the whole input. */
export function toEmbedUrlByPattern(input: string): string | null {
  const youtube = YOUTUBE_URL.exec(input);
  if (youtube !== null) return youtubeEmbed(youtube[1]);
  const vimeo = VIMEO_URL.exec(input);
  return vimeo === null ? null : vimeoEmbed(vimeo[1]);
}
