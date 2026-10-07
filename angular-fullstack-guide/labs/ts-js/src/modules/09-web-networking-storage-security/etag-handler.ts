// Section 4: a content-hash ETag handler (conditional GET) and a content-hash file-name helper.
import type { Handler } from './support/http-server.js';

/** First 16 hex digits of the SHA-256 of `text`. */
export const contentHash = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
};

/** A strong entity tag: a quoted content hash, so it changes exactly when the content does. */
export const etagOf = async (body: string): Promise<string> => `"${await contentHash(body)}"`;

const opaqueTag = (tag: string): string => tag.trim().replace(/^W\//, '');

/** `If-None-Match` matches with the weak comparison (RFC 9110 section 13.1.2): `W/` is ignored, `*` matches anything. */
export const matchesIfNoneMatch = (header: string | undefined, etag: string): boolean =>
  header !== undefined && header.split(',').some((candidate) => candidate.trim() === '*' || opaqueTag(candidate) === opaqueTag(etag));

/** Answers 304 with no body when the client's validator is current, otherwise 200 with the body and its ETag. */
export const createEtagHandler =
  (readBody: () => string, cacheControl = 'no-cache'): Handler =>
  async (request, response) => {
    const body = readBody();
    const etag = await etagOf(body);
    const headers = { ETag: etag, 'Cache-Control': cacheControl };
    if (matchesIfNoneMatch(request.headers['if-none-match'] as string | undefined, etag)) {
      response.writeHead(304, headers).end();
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Type': 'text/plain' }).end(body);
  };

/** `app.js` and its content become `app.<hash>.js`: a new name whenever the content changes. */
export const hashedFileName = async (name: string, content: string): Promise<string> => {
  const dot = name.lastIndexOf('.');
  const [stem, extension] = dot < 0 ? [name, ''] : [name.slice(0, dot), name.slice(dot)];
  return `${stem}.${(await contentHash(content)).slice(0, 8)}${extension}`;
};
