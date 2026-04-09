import { formatMarkdownTable, htmlToMarkdown } from './markdown.js';

export function renderTable(head, rows) {
  // eslint-disable-next-line no-console
  console.log(formatMarkdownTable(head, rows));
}

export function renderInfo(message) {
  // eslint-disable-next-line no-console
  console.log(htmlToMarkdown(message));
}

export function renderSuccess(message) {
  // eslint-disable-next-line no-console
  console.log(`> Success: ${htmlToMarkdown(message, { inline: true })}`);
}

export function renderWarning(message) {
  // eslint-disable-next-line no-console
  console.log(`> Warning: ${htmlToMarkdown(message, { inline: true })}`);
}

export function renderError(message) {
  // eslint-disable-next-line no-console
  console.error(`> Error: ${htmlToMarkdown(message, { inline: true })}`);
}
