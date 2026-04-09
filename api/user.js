import { DoubanClient } from './client.js';
import { parseProfileFromHtml } from './profile-parser.js';

const client = new DoubanClient();
const HTML_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

function isAuthorizationFailure(error) {
  return /authorization or anti-bot policy/i.test(error?.message || '');
}

export async function getMyProfile() {
  try {
    return await client.request('/j/mine', {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        origin: 'https://www.douban.com',
        'x-requested-with': 'XMLHttpRequest',
      },
    });
  } catch (error) {
    if (!isAuthorizationFailure(error)) {
      throw error;
    }

    const html = await client.request('/mine/', {
      headers: {
        accept: HTML_ACCEPT,
      },
    });
    const profile = parseProfileFromHtml(html);
    if (!profile) {
      throw error;
    }
    return profile;
  }
}
