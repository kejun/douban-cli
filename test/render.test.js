import test from 'node:test';
import assert from 'node:assert/strict';

import { formatMarkdownTable, htmlToMarkdown } from '../utils/markdown.js';

test('htmlToMarkdown converts common html fragments to markdown', () => {
  assert.equal(
    htmlToMarkdown('<p><strong>豆瓣</strong><br><a href="https://book.douban.com">图书</a></p>'),
    '**豆瓣**\n[图书](https://book.douban.com)'
  );
});

test('formatMarkdownTable renders markdown tables and converts html cells', () => {
  assert.equal(
    formatMarkdownTable(
      ['Title', 'Link'],
      [['<strong>三体</strong>', '<a href="https://book.douban.com/subject/26647087/">详情</a>']]
    ),
    [
      '| Title | Link |',
      '| --- | --- |',
      '| **三体** | [详情](https://book.douban.com/subject/26647087/) |',
    ].join('\n')
  );
});
