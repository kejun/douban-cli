const HTML_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

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

function stripHtml(value = '') {
  return normalizeSpace(
    decodeHtmlEntities(
      value
        .replace(/<br\s*\/?>/gi, ' / ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function extractText(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = match?.slice(1).reverse().find(Boolean);
    if (value) {
      return stripHtml(value);
    }
  }

  return '';
}

function extractYear(html) {
  const patterns = [
    /<span[^>]*class=(["'])year\1[^>]*>\((\d{4})\)<\/span>/i,
    /出版年:<\/span>\s*([^<]+)/i,
    /上映日期:<\/span>\s*([^<]+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = stripHtml(match?.[2] || match?.[1] || '');
    const year = value.match(/\b(19|20)\d{2}\b/)?.[0];
    if (year) {
      return year;
    }
  }

  return '-';
}

function extractEpisode(html) {
  const value = extractText(html, [/集数:<\/span>\s*([^<]+)/i]);
  return value || '-';
}

export function isDoubanSubjectId(value = '') {
  return /^\d+$/.test(String(value).trim());
}

export function parseSubjectInfoFromHtml(html, { id, type, url } = {}) {
  if (!html || typeof html !== 'string' || !id) {
    return null;
  }

  const title =
    extractText(html, [
      /<span[^>]*property=(["'])v:itemreviewed\1[^>]*>([\s\S]*?)<\/span>/i,
      /<title>([\s\S]*?)\s*\(豆瓣\)<\/title>/i,
    ]) || '-';

  return {
    id: String(id),
    title,
    year: extractYear(html),
    type: type || '-',
    episode: type === 'movie' ? extractEpisode(html) : '-',
    url: url || '-',
  };
}

export async function fetchSubjectById(subjectId, { request } = {}) {
  const normalizedId = String(subjectId || '').trim();
  if (!isDoubanSubjectId(normalizedId)) {
    throw new Error('Subject id is required.');
  }

  const requestFn = request || (async (...args) => {
    const { DoubanClient } = await import('./client.js');
    const client = new DoubanClient();
    return client.request(...args);
  });

  for (const type of ['movie', 'book']) {
    const url = `https://${type}.douban.com/subject/${normalizedId}/`;

    try {
      const html = await requestFn(url, {
        headers: {
          accept: HTML_ACCEPT,
        },
      });

      return parseSubjectInfoFromHtml(html, {
        id: normalizedId,
        type,
        url,
      });
    } catch (error) {
      if (!String(error?.message || '').startsWith('HTTP 404:')) {
        throw error;
      }
    }
  }

  throw new Error(`Subject not found: ${normalizedId}`);
}
