import { buildSubjectUrl } from '../utils/search-results.js';

function normalizeSpace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

const TITLE_YEAR_PATTERN = /\s*\((\d{4})\)\s*$/;

function decodeHtmlEntities(value = '') {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/gi, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === '#') {
      const isHex = lower.length > 1 && lower[1] === 'x';
      const code = Number.parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    return named[lower] || match;
  });
}

function stripHtml(value = '') {
  return normalizeSpace(
    decodeHtmlEntities(
      value
        .replace(/<br\s*\/?>/gi, ' / ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSegments(html, className) {
  const pattern = new RegExp(
    `<(?:div|li)[^>]*class=(["'])[^"'<>]*\\b${escapeRegExp(className)}\\b[^"'<>]*\\1[^>]*>`,
    'gi'
  );
  const matches = [...html.matchAll(pattern)];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? html.length;
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

function extractSubjectIdFromSegment(segment = '') {
  return segment.match(/\bsubject_id\s*[:=]\s*['"]?(\d+)['"]?/)?.[1] || '';
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

function extractTextByClass(segment, className) {
  const pattern = new RegExp(
    `<([a-zA-Z0-9:-]+)[^>]*class=(["'])[^"']*\\b${escapeRegExp(className)}\\b[^"']*\\2[^>]*>([\\s\\S]*?)<\\/\\1>`,
    'i'
  );
  return stripHtml(
    extractFirstMatch(segment, [pattern])?.[3] || ''
  );
}

function getSubjectSubtype(href, defaultSubtype) {
  try {
    const hostname = new URL(href).hostname;
    if (hostname === 'book.douban.com') {
      return 'book';
    }
    if (hostname === 'movie.douban.com') {
      return 'movie';
    }
  } catch {
    // ignore malformed urls and keep fallback subtype
  }

  return defaultSubtype;
}

function extractTitleData(segment) {
  const titlePatterns = [
    {
      pattern:
        /<div[^>]+class=(["'])[^"']*\btitle\b[^"']*\1[^>]*>[\s\S]*?<a[^>]+href=(["'])([^"']*)\2[^>]*>([\s\S]*?)<\/a>/i,
      hrefGroup: 3,
      textGroup: 4,
    },
    {
      pattern: /<h3[^>]*>[\s\S]*?<a[^>]+href=(["'])([^"']*)\1[^>]*>([\s\S]*?)<\/a>/i,
      hrefGroup: 2,
      textGroup: 3,
    },
  ];

  for (const { pattern, hrefGroup, textGroup } of titlePatterns) {
    const match = segment.match(pattern);
    if (match) {
      return {
        href: normalizeSubjectUrl(match[hrefGroup] || ''),
        rawTitle: stripHtml(match[textGroup] || ''),
      };
    }
  }

  return null;
}

function parseSubjectSegment(segment, defaultSubtype) {
  const titleData = extractTitleData(segment);
  if (!titleData) {
    return null;
  }

  const { href, rawTitle } = titleData;
  const id = extractSubjectId(href) || extractSubjectIdFromSegment(segment);
  if (!id) {
    return null;
  }

  const titleYearMatch = rawTitle.match(TITLE_YEAR_PATTERN);
  const titleWithoutYear = rawTitle.replace(TITLE_YEAR_PATTERN, '').trim();
  const yearFromTitle = titleYearMatch?.[1] || '';
  const subjectCastText = extractTextByClass(segment, 'subject-cast');
  const yearFromMeta = subjectCastText.match(/\b(19|20)\d{2}\b/)?.[0] || '';

  const subtype = getSubjectSubtype(href, defaultSubtype);

  return {
    id,
    title: titleWithoutYear || rawTitle || '-',
    year: yearFromTitle || yearFromMeta || '-',
    subtype,
    url: extractSubjectId(href) ? href : buildSubjectUrl(id, subtype) || href || '-',
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
