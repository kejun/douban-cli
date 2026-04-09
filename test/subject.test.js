import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchSubjectById, isDoubanSubjectId, parseSubjectInfoFromHtml } from '../api/subject.js';

test('isDoubanSubjectId matches numeric douban ids only', () => {
  assert.equal(isDoubanSubjectId('26647087'), true);
  assert.equal(isDoubanSubjectId(' 26647087 '), true);
  assert.equal(isDoubanSubjectId('tt1570728'), false);
  assert.equal(isDoubanSubjectId('三体'), false);
});

test('parseSubjectInfoFromHtml parses movie subject html', () => {
  const html = `
    <html>
      <head><title>奥本海默 (豆瓣)</title></head>
      <body>
        <span property="v:itemreviewed">奥本海默</span>
        <span class="year">(2023)</span>
        <span class="pl">集数:</span> 3<br>
      </body>
    </html>
  `;

  assert.deepEqual(
    parseSubjectInfoFromHtml(html, {
      id: '35575567',
      type: 'movie',
      url: 'https://movie.douban.com/subject/35575567/',
    }),
    {
      id: '35575567',
      title: '奥本海默',
      year: '2023',
      type: 'movie',
      episode: '3',
      url: 'https://movie.douban.com/subject/35575567/',
    }
  );
});

test('fetchSubjectById falls back from movie to book subject pages', async () => {
  const html = `
    <html>
      <head><title>三体 (豆瓣)</title></head>
      <body>
        <span property="v:itemreviewed">三体</span>
        <div id="info"><span class="pl">出版年:</span> 2008-01</div>
      </body>
    </html>
  `;

  const requests = [];
  const request = async (url) => {
    requests.push(url);
    if (url === 'https://movie.douban.com/subject/26647087/') {
      throw new Error('HTTP 404: ');
    }
    if (url === 'https://book.douban.com/subject/26647087/') {
      return html;
    }
    throw new Error(`Unexpected url: ${url}`);
  };

  assert.deepEqual(await fetchSubjectById('26647087', { request }), {
    id: '26647087',
    title: '三体',
    year: '2008',
    type: 'book',
    episode: '-',
    url: 'https://book.douban.com/subject/26647087/',
  });

  assert.deepEqual(requests, [
    'https://movie.douban.com/subject/26647087/',
    'https://book.douban.com/subject/26647087/',
  ]);
});
