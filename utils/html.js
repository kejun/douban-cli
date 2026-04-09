export function normalizeSpace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function decodeHtmlEntities(value = '') {
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

export function stripHtml(value = '') {
  return normalizeSpace(
    decodeHtmlEntities(
      value
        .replace(/<br\s*\/?>/gi, ' / ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}
