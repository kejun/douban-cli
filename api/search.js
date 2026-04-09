import { DoubanClient } from './client.js';
import { parseSearchSubjects } from './search-parser.js';

const client = new DoubanClient();

const CAT_BY_TYPE = {
  movie: '1002',
  book: '1001',
};

const HTML_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

async function fetchSearchPage(query, type) {
  return client.request('/search', {
    query: {
      cat: CAT_BY_TYPE[type],
      q: query,
    },
    headers: {
      accept: HTML_ACCEPT,
    },
  });
}

async function fetchSubjectSearchPage(query, type) {
  return client.request(`https://search.douban.com/${type}/subject_search`, {
    query: {
      search_text: query,
      cat: CAT_BY_TYPE[type],
    },
    headers: {
      accept: HTML_ACCEPT,
    },
  });
}

export async function searchSubjects(query, { type = 'movie' } = {}) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) {
    throw new Error('Search query is required.');
  }

  const normalizedType = type === 'book' ? 'book' : 'movie';
  const primaryHtml = await fetchSearchPage(normalizedQuery, normalizedType);
  const primaryResults = parseSearchSubjects(primaryHtml, { type: normalizedType });
  if (primaryResults.length > 0) {
    return primaryResults;
  }

  const fallbackHtml = await fetchSubjectSearchPage(normalizedQuery, normalizedType);
  return parseSearchSubjects(fallbackHtml, { type: normalizedType });
}
