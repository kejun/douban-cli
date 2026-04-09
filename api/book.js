import { DoubanClient } from './client.js';
import { searchSubjects } from './search.js';

const client = new DoubanClient();

export async function searchBooks(query) {
  return searchSubjects(query, { type: 'book' });
}

export async function wishBook(keyword) {
  if (!keyword?.trim()) {
    throw new Error('Book keyword is required.');
  }

  const first = (await searchBooks(keyword))[0];
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
