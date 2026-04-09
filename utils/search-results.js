export function buildSubjectUrl(id, subtype = 'movie') {
  const normalizedId = String(id || '').trim();
  const normalizedSubtype = subtype === 'book' ? 'book' : subtype === 'movie' ? 'movie' : '';

  if (!normalizedId || !normalizedSubtype) {
    return '';
  }

  return `https://${normalizedSubtype}.douban.com/subject/${normalizedId}/`;
}

export function normalizeSearchSubject(item, defaultSubtype = 'movie') {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const subtype = item.subtype === 'book' ? 'book' : item.subtype === 'movie' ? 'movie' : defaultSubtype;
  const canonicalUrl = buildSubjectUrl(item.id, subtype);

  return {
    ...item,
    subtype,
    url: item.url || canonicalUrl || '-',
  };
}

export function normalizeSearchResult(result, defaultSubtype = 'movie') {
  if (Array.isArray(result)) {
    return result.map((item) => normalizeSearchSubject(item, defaultSubtype));
  }

  if (Array.isArray(result?.subjects)) {
    return {
      ...result,
      subjects: result.subjects.map((item) => normalizeSearchSubject(item, defaultSubtype)),
    };
  }

  return result;
}
