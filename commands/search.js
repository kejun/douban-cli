import { searchMovies } from '../api/movie.js';
import { searchBooks } from '../api/book.js';
import { getCached, setCached } from '../utils/cache.js';
import { renderError, renderTable, renderWarning } from '../utils/render.js';

function normalizeSubjects(result) {
  if (Array.isArray(result)) {
    return result;
  }
  return result?.subjects || [];
}

export function registerSearchCommand(program) {
  program
    .command('search <keyword>')
    .description('Search movie or book')
    .option('-t, --type <type>', 'movie|book', 'movie')
    .action(async (keyword, options) => {
      try {
        const type = options.type === 'book' ? 'book' : 'movie';
        const cacheKey = `search:${type}:${keyword}`;
        const cached = await getCached(cacheKey);
        const result = cached || (type === 'book' ? await searchBooks(keyword) : await searchMovies(keyword));

        if (!cached) {
          await setCached(cacheKey, result);
        }

        const items = normalizeSubjects(result);
        if (items.length === 0) {
          renderWarning('No results found.');
          return;
        }

        renderTable(
          ['ID', 'Title', 'Year', 'Subtype'],
          items.slice(0, 20).map((item) => [item.id || '-', item.title || '-', item.year || '-', item.subtype || '-'])
        );
      } catch (error) {
        renderError(`Search failed: ${error.message}`);
        process.exitCode = 1;
      }
    });
}
