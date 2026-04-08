import { getMyProfile } from '../api/user.js';
import { renderError, renderInfo } from '../utils/render.js';

export function registerProfileCommand(program) {
  program
    .command('me')
    .description('Show current user profile data')
    .action(async () => {
      try {
        const profile = await getMyProfile();
        renderInfo(JSON.stringify(profile, null, 2));
      } catch (error) {
        renderError(`Profile failed: ${error.message}`);
        process.exitCode = 1;
      }
    });
}
