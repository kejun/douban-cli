import { wishMovie } from '../api/movie.js';
import { wishBook } from '../api/book.js';
import { renderError, renderSuccess } from '../utils/render.js';

export function registerWishCommand(program) {
  program
    .command('wish <keywordOrId>')
    .description('Mark wish for movie or book')
    .option('-t, --type <type>', 'movie|book', 'movie')
    .action(async (keywordOrId, options) => {
      try {
        if (options.type === 'book') {
          await wishBook(keywordOrId);
          renderSuccess(`Book wish created for: ${keywordOrId}`);
          return;
        }

        await wishMovie(keywordOrId);
        renderSuccess(`Movie wish created for: ${keywordOrId}`);
      } catch (error) {
        renderError(`Wish failed: ${error.message}`);
        process.exitCode = 1;
      }
    });
}
