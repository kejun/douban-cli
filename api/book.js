import { DoubanClient } from './client.js';

const client = new DoubanClient();

export async function searchBooks(query) {
  if (!query?.trim()) {
    throw new Error('Search query is required.');
  }
  return client.request('/j/search_subjects', {
    query: { type: 'book', query: query.trim() },
  });
}

export async function wishBook(keyword) {
  if (!keyword?.trim()) {
    throw new Error('Book keyword is required.');
  }

  const result = await client.request('/j/search_subjects', {
    query: { type: 'book', query: keyword.trim() },
  });

  const first = result?.subjects?.[0];
  if (!first?.id) {
    throw new Error('No matching book found for wish action.');
  }

  return client.request(`/j/subject/${first.id}/interest`, {
    method: 'POST',
    form: {
      interest: 'wish',
    },
  });
}
