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

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/gi, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === '#') {
      const isHex = lower.startsWith('#x');
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

function toAbsoluteDoubanUrl(value = '') {
  try {
    return new URL(decodeHtmlEntities(value), 'https://www.douban.com').toString();
  } catch {
    return '';
  }
}

function scoreProfileAnchor(anchorHtml, attributes, text) {
  let score = 0;

  if (/\b(?:lnk-mine|nav-user-account|minfo|user-info|top-nav-info|usr-info)\b/i.test(attributes)) {
    score += 10;
  }

  if (text && !/^(我的豆瓣|个人主页|豆瓣主页)$/i.test(text)) {
    score += 5;
  }

  if (/<img\b/i.test(anchorHtml)) {
    score += 1;
  }

  return score;
}

export function parseProfileFromHtml(html) {
  if (!html || typeof html !== 'string') {
    return null;
  }

  const anchorPattern =
    /<a\b([^>]*?)href=(["'])([^"']*\/people\/([^/"'?]+)\/?[^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  const matches = [...html.matchAll(anchorPattern)];

  let bestMatch = null;

  for (const match of matches) {
    const anchorHtml = match[0] || '';
    const attributes = `${match[1] || ''} ${match[5] || ''}`;
    const url = toAbsoluteDoubanUrl(match[3] || '');
    const id = decodeURIComponent(match[4] || '').trim();
    const text = stripHtml(match[6] || '');
    const score = scoreProfileAnchor(anchorHtml, attributes, text);

    if (!url || !id) {
      continue;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { score, id, name: text, url };
    }
  }

  if (!bestMatch) {
    return null;
  }

  return {
    id: bestMatch.id,
    name: bestMatch.name || bestMatch.id,
    url: bestMatch.url,
    source: 'html-fallback',
  };
}
