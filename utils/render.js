import chalk from 'chalk';
import Table from 'cli-table3';

export function renderTable(head, rows) {
  const table = new Table({ head });
  for (const row of rows) {
    table.push(row);
  }
  // eslint-disable-next-line no-console
  console.log(table.toString());
}

export function renderInfo(message) {
  // eslint-disable-next-line no-console
  console.log(chalk.cyan(message));
}

export function renderSuccess(message) {
  // eslint-disable-next-line no-console
  console.log(chalk.green(message));
}

export function renderWarning(message) {
  // eslint-disable-next-line no-console
  console.log(chalk.yellow(message));
}

export function renderError(message) {
  // eslint-disable-next-line no-console
  console.error(chalk.red(message));
}
