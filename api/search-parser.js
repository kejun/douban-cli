function normalizeSpace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(value = '') {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === '#') {
      const isHex = lower[1] === 'x';
      const code = Number.parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    return named[lower] || match;
  });
}

function stripHtml(value = '') {
  return normalizeSpace(decodeHtmlEntities(value.replace(/<br\s*\/?>/gi, ' / ').replace(/<[^>]+>/g, ' ')));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSegments(html, className) {
  const pattern = new RegExp(
    `<(?:div|li)[^>]+class=(["'])[^"'<>]*\\b${escapeRegExp(className)}\\b[^"'<>]*\\1[^>]*>`,
    'gi'
  );
  const matches = [...html.matchAll(pattern)];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? html.length : html.length;
    return html.slice(start, end);
  });
}

function normalizeSubjectUrl(rawHref = '') {
  const decoded = decodeHtmlEntities(rawHref);

  try {
    const url = new URL(decoded, 'https://www.douban.com');
    const redirected = url.searchParams.get('url');
    return redirected ? decodeURIComponent(redirected) : url.toString();
  } catch {
    return decoded;
  }
}

function extractSubjectId(url = '') {
  return url.match(/\/\/(?:movie|book)\.douban\.com\/subject\/(\d+)/)?.[1] || '';
}

function extractFirstMatch(segment, patterns) {
  for (const pattern of patterns) {
    const match = segment.match(pattern);
    if (match) {
      return match;
    }
  }
  return null;
}

function parseSubjectSegment(segment, defaultSubtype) {
  const titleMatch = extractFirstMatch(segment, [
    /<div[^>]+class=(["'])[^"']*\btitle\b[^"']*\1[^>]*>[\s\S]*?<a[^>]+href=(["'])(.*?)\2[^>]*>([\s\S]*?)<\/a>/i,
    /<h3[^>]*>[\s\S]*?<a[^>]+href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/i,
  ]);

  if (!titleMatch) {
    return null;
  }

  const href = normalizeSubjectUrl(titleMatch.at(-2) || '');
  const id = extractSubjectId(href);
  if (!id) {
    return null;
  }

  const rawTitle = stripHtml(titleMatch.at(-1) || '');
  const titleWithoutYear = rawTitle.replace(/\s*\((\d{4})\)\s*$/, '').trim();
  const yearFromTitle = rawTitle.match(/\((\d{4})\)\s*$/)?.[1] || '';
  const subjectCastText = stripHtml(
    extractFirstMatch(segment, [/<[^>]+class=(["'])[^"']*\bsubject-cast\b[^"']*\1[^>]*>([\s\S]*?)<\/[^>]+>/i])?.[2] || ''
  );
  const yearFromMeta = subjectCastText.match(/\b(19|20)\d{2}\b/)?.[0] || '';
  const subtype =
    href.includes('book.douban.com') ? 'book' : href.includes('movie.douban.com') ? 'movie' : defaultSubtype;

  return {
    id,
    title: titleWithoutYear || rawTitle || '-',
    year: yearFromTitle || yearFromMeta || '-',
    subtype,
  };
}

export function parseSearchSubjects(html, { type = 'movie' } = {}) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const segments = [...extractSegments(html, 'item-root'), ...extractSegments(html, 'result')];
  const seen = new Set();
  const items = [];

  for (const segment of segments) {
    const item = parseSubjectSegment(segment, type);
    if (!item || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    items.push(item);
  }

  return items;
}
