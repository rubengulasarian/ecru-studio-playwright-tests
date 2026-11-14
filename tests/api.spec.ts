import { test, expect } from '@playwright/test';

/**
 * REST API tests against the public JSONPlaceholder fake API.
 * The ÉCRU site is a static front-end without a back end, so these tests show the
 * API-testing approach (status codes, schema, filtering, CRUD) on a separate service.
 */
test.describe('JSONPlaceholder REST API @api', () => {
  test.use({
    baseURL: process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  test('GET /posts returns the full list of posts', async ({ request }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const posts = await response.json();
    expect(posts).toHaveLength(100);
    expect(posts[0]).toEqual(
      expect.objectContaining({
        userId: expect.any(Number),
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
      }),
    );
  });

  test('GET /posts/1 returns a single post', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, userId: 1 });
  });

  test('GET /posts/{unknown id} returns 404', async ({ request }) => {
    const response = await request.get('/posts/999999');
    expect(response.status()).toBe(404);
  });

  test('GET /posts?userId=1 filters posts by author', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 1 } });
    expect(response.ok()).toBe(true);
    const posts: Array<{ userId: number }> = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) expect(post.userId).toBe(1);
  });

  test('GET /posts/1/comments returns the comments of that post', async ({ request }) => {
    const response = await request.get('/posts/1/comments');
    expect(response.ok()).toBe(true);
    const comments: Array<{ postId: number; email: string }> = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    for (const comment of comments) {
      expect(comment.postId).toBe(1);
      expect(comment.email).toMatch(/^[^@\s]+@[^@\s]+$/);
    }
  });

  test('POST /posts creates a resource and returns 201', async ({ request }) => {
    const payload = { title: 'QA automation', body: 'created by a Playwright API test', userId: 7 };
    const response = await request.post('/posts', { data: payload });
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ ...payload, id: expect.any(Number) });
  });

  test('PUT /posts/1 replaces a resource', async ({ request }) => {
    const payload = { id: 1, title: 'updated', body: 'updated body', userId: 1 };
    const response = await request.put('/posts/1', { data: payload });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(payload);
  });

  test('PATCH /posts/1 updates a single field', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: { title: 'patched title' } });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, title: 'patched title' });
  });

  test('DELETE /posts/1 returns 200', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });
});
