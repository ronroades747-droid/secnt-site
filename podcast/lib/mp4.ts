// Each enclosure's byte length, read at build from Bunny's own answer to a
// HEAD request on the MP4's public address (Editor's ruling, 12 Nov 2026, Ask
// §9 Q3): no API key, and nothing recorded by hand to drift.
//
// A missing MP4 FAILS the build, naming the lecture. The lecture site then
// keeps serving its last good deploy, and secnt.org — a separate Pages
// project — is untouched. An episode is never silently left out of the feed.
import { mp4Url } from './episodes';

const lengths = new Map<string, Promise<number>>();

async function head(url: string): Promise<Response> {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status < 500) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (err) {
      last = err;
    }
    await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
  }
  throw last;
}

export function mp4Length(bunnyVideoId: string, label: string): Promise<number> {
  let p = lengths.get(bunnyVideoId);
  if (!p) {
    const url = mp4Url(bunnyVideoId);
    p = head(url).then((res) => {
      const len = Number(res.headers.get('content-length'));
      if (res.status !== 200 || !(len > 0)) {
        throw new Error(
          `[podcast] no MP4 for "${label}" (${bunnyVideoId}): HEAD ${url} → ${res.status}` +
            (res.status === 403
              ? ' — is "Block direct URL file access" on in the Bunny library?'
              : res.status === 404
                ? ' — re-encode the video in Bunny with MP4 Fallback on.'
                : '')
        );
      }
      return len;
    });
    lengths.set(bunnyVideoId, p);
  }
  return p;
}
