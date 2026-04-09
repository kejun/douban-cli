import { loginAndSaveSession } from '../auth/login.js';
import { importCookiesFromFile } from '../auth/session.js';
import { renderError, renderSuccess } from '../utils/render.js';

export function registerLoginCommand(program) {
  program
    .command('login')
    .description('Login via browser and persist session cookies')
    .option('--import-cookie <file>', 'Import cookies from a local JSON file')
    .action(async (options) => {
      try {
        if (options.importCookie) {
          await importCookiesFromFile(options.importCookie);
          renderSuccess('Cookies imported and session saved.');
          return;
        }
        const count = await loginAndSaveSession();
        renderSuccess(`Login succeeded. Saved ${count} cookies.`);
      } catch (error) {
        renderError(error.message);
        process.exitCode = 1;
      }
    });
}
