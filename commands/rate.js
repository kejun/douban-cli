import { rateMovie } from '../api/movie.js';
import { renderError, renderSuccess } from '../utils/render.js';

export function registerRateCommand(program) {
  program
    .command('rate <subjectId> <stars>')
    .description('Rate a movie with stars 1-5')
    .action(async (subjectId, stars) => {
      try {
        const parsedStars = Number(stars);
        await rateMovie(subjectId, parsedStars);
        renderSuccess(`Rated ${subjectId} with ${parsedStars} stars.`);
      } catch (error) {
        renderError(`Rate failed: ${error.message}`);
        process.exitCode = 1;
      }
    });
}
