#!/usr/bin/env node

import { Command } from 'commander';
import { registerSearchCommand } from './commands/search.js';
import { registerInfoCommand } from './commands/info.js';
import { registerRateCommand } from './commands/rate.js';
import { registerWishCommand } from './commands/wish.js';
import { registerProfileCommand } from './commands/profile.js';
import { registerLogoutCommand } from './commands/logout.js';
import { registerLoginCommand } from './commands/login.js';
import { renderError } from './utils/render.js';

const program = new Command();

program
  .name('douban')
  .description('Douban CLI with cookie-based session and HTTP API access')
  .version('0.1.0');

registerLoginCommand(program);
registerSearchCommand(program);
registerInfoCommand(program);
registerRateCommand(program);
registerWishCommand(program);
registerProfileCommand(program);
registerLogoutCommand(program);

program.parseAsync(process.argv).catch((error) => {
  renderError(error.message);
  process.exitCode = 1;
});
