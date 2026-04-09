import { DoubanClient } from './client.js';

const client = new DoubanClient();

export async function getMyProfile() {
  return client.request('/j/mine');
}
