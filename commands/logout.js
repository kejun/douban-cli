import { clearSession, getSessionFilePath } from '../auth/session.js';
import { renderSuccess } from '../utils/render.js';

export function registerLogoutCommand(program) {
  program
    .command('logout')
    .description('Clear local session cookies')
    .action(async () => {
      await clearSession();
      renderSuccess(`Session cleared: ${getSessionFilePath()}`);
    });
}
