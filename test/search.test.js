import test from 'node:test';
import assert from 'node:assert/strict';

import { parseSearchSubjects } from '../api/search-parser.js';

test('parseSearchSubjects parses homepage movie search results', () => {
  const html = `
    <div class="search-result">
      <div class="result-list">
        <div class="result">
          <div class="content">
            <div class="title">
              <h3>
                <a href="https://www.douban.com/link2/?url=https%3A%2F%2Fmovie.douban.com%2Fsubject%2F35575567%2F">
                  奥本海默 (2023)
                </a>
              </h3>
            </div>
            <div class="subject-cast">原名: Oppenheimer / 2023 / 美国</div>
          </div>
        </div>
      </div>
    </div>
  `;

  assert.deepEqual(parseSearchSubjects(html, { type: 'movie' }), [
    {
      id: '35575567',
      title: '奥本海默',
      year: '2023',
      subtype: 'movie',
      url: 'https://movie.douban.com/subject/35575567/',
    },
  ]);
});

test('parseSearchSubjects parses subject search results', () => {
  const html = `
    <div id="root">
      <div class="item-root">
        <div class="title">
          <a href="https://book.douban.com/subject/33440205/">三体</a>
        </div>
        <span class="rating_nums">8.7</span>
      </div>
      <div class="item-root">
        <div class="title">
          <a href="https://book.douban.com/subject/25785114/">三体Ⅱ</a>
        </div>
      </div>
    </div>
  `;

  assert.deepEqual(parseSearchSubjects(html, { type: 'book' }), [
    {
      id: '33440205',
      title: '三体',
      year: '-',
      subtype: 'book',
      url: 'https://book.douban.com/subject/33440205/',
    },
    {
      id: '25785114',
      title: '三体Ⅱ',
      year: '-',
      subtype: 'book',
      url: 'https://book.douban.com/subject/25785114/',
    },
  ]);
});
