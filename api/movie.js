import { DoubanClient } from './client.js';

const client = new DoubanClient();

export async function searchMovies(query) {
  if (!query?.trim()) {
    throw new Error('Search query is required.');
  }
  return client.request('/j/search_subjects', {
    query: { type: 'movie', query: query.trim() },
  });
}

export async function suggestSubject(keyword) {
  if (!keyword?.trim()) {
    throw new Error('Subject id or keyword is required.');
  }
  return client.request('/j/subject_suggest', {
    query: { q: keyword.trim() },
  });
}

export async function rateMovie(subjectId, stars) {
  if (!subjectId?.trim()) {
    throw new Error('Subject id is required.');
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new Error('Stars must be an integer between 1 and 5.');
  }

  return client.request('/rating/rate', {
    method: 'POST',
    form: {
      sid: subjectId.trim(),
      stars,
      action: 'done',
    },
  });
}

export async function wishMovie(keywordOrId) {
  const suggests = await suggestSubject(keywordOrId);
  const first = Array.isArray(suggests) ? suggests[0] : null;
  if (!first?.id) {
    throw new Error('No matching movie found for wish action.');
  }

  return client.request(`/j/subject/${first.id}/interest`, {
    method: 'POST',
    form: {
      interest: 'wish',
    },
  });
}
