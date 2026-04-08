import { suggestSubject } from '../api/movie.js';
import { renderError, renderInfo, renderTable, renderWarning } from '../utils/render.js';

export function registerInfoCommand(program) {
  program
    .command('info <idOrKeyword>')
    .description('Show subject suggestion details by id or keyword')
    .action(async (idOrKeyword) => {
      try {
        const data = await suggestSubject(idOrKeyword);
        if (!Array.isArray(data) || data.length === 0) {
          renderWarning('No matching subject found.');
          return;
        }

        const top = data[0];
        renderInfo(`Top match: ${top.title || top.sub_title || '-'} (${top.year || '-'})`);
        renderTable(
          ['ID', 'Title', 'Year', 'Type', 'Episode'],
          data.slice(0, 10).map((item) => [item.id || '-', item.title || '-', item.year || '-', item.type || '-', item.episode || '-'])
        );
      } catch (error) {
        renderError(`Info failed: ${error.message}`);
        process.exitCode = 1;
      }
    });
}
