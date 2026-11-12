// Copies the few static files the lecture site shares with secnt.org — the
// self-hosted fonts the stylesheet loads from /fonts/, and the favicons — from
// the repository's public/ into the lecture site's build output. One copy in
// git, served from both hosts; nothing per-file to keep in step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHARED = ['fonts', 'favicon.svg', 'favicon.ico'];

export const copyChrome = {
  name: 'secnt:podcast-copy-chrome',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      for (const name of SHARED) {
        fs.cpSync(path.join(process.cwd(), 'public', name), path.join(out, name), {
          recursive: true,
        });
      }
      logger.info(`copied ${SHARED.join(', ')} from public/`);
    },
  },
};
