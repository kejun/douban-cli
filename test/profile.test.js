import test from 'node:test';
import assert from 'node:assert/strict';

import { parseProfileFromHtml } from '../api/profile-parser.js';
import { formatProfileMarkdown } from '../utils/profile.js';

test('parseProfileFromHtml extracts the signed-in profile link from dashboard html', () => {
  const html = `
    <html>
      <body>
        <div class="top-nav-info">
          <a class="nav-user-account lnk-mine" href="/people/alice/">
            Alice
          </a>
        </div>
      </body>
    </html>
  `;

  assert.deepEqual(parseProfileFromHtml(html), {
    id: 'alice',
    name: 'Alice',
    url: 'https://www.douban.com/people/alice/',
    source: 'html-fallback',
  });
});

test('formatProfileMarkdown renders profile data as markdown bullet list', () => {
  const markdown = formatProfileMarkdown({
    id: 'alice',
    name: 'Alice',
    url: 'https://www.douban.com/people/alice/',
    stats: {
      movies: 12,
      books: 3,
    },
    tags: ['movie', 'book'],
  });

  assert.equal(
    markdown,
    [
      '# Alice',
      '',
      '- Id: alice',
      '- Name: Alice',
      '- Url: https://www.douban.com/people/alice/',
      '- Stats:',
      '  - Movies: 12',
      '  - Books: 3',
      '- Tags: movie, book',
    ].join('\n')
  );
});
