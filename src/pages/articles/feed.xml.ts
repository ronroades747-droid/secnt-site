// SECNT Articles: the published articles only, newest first (Release D,
// ruling 25; see src/lib/feeds.ts).
import type { APIRoute } from 'astro';
import { FEEDS, rss, articleItems } from '../../lib/feeds';

export const GET: APIRoute = async () => rss(FEEDS.articles, await articleItems());
