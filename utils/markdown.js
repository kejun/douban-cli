function decodeHtmlEntities(value = '') {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === '#') {
      const isHex = lower[1] === 'x';
      const digits = lower.slice(isHex ? 2 : 1);
      if (!digits) {
        return match;
      }
      const code = Number.parseInt(digits, isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    return named[lower] || match;
  });
}

function normalizeMarkdownWhitespace(value = '') {
  return value
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function htmlToMarkdown(value = '', { inline = false } = {}) {
  if (value == null) {
    return '';
  }

  const markdown = decodeHtmlEntities(String(value))
    .replace(/<a\b[^>]*href=(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi, '[$3]($2)')
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p\b[^>]*>/gi, '\n\n')
    .replace(/<p\b[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul\b[^>]*>|<\/ul>|<ol\b[^>]*>|<\/ol>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  const normalized = normalizeMarkdownWhitespace(markdown);
  return inline ? normalized.replace(/\n+/g, ' / ') : normalized;
}

function escapeMarkdownTableCell(value = '') {
  return htmlToMarkdown(value, { inline: true }).replace(/\\/g, '\\\\').replace(/\|/g, '\\|') || '-';
}

export function formatMarkdownTable(head, rows) {
  const headers = head.map((cell) => escapeMarkdownTableCell(cell));
  const separator = head.map(() => '---');
  const body = rows.map((row) => row.map((cell) => escapeMarkdownTableCell(cell)));

  return [
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}
