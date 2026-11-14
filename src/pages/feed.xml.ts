// New on SECNT: every published commentary page and article, newest first
// (Release D, ruling 25; see src/lib/feeds.ts).
import type { APIRoute } from 'astro';
import { FEEDS, rss, commentaryItems, articleItems } from '../lib/feeds';

export const GET: APIRoute = async () =>
  rss(FEEDS.all, [...(await commentaryItems()), ...(await articleItems())]);
