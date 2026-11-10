import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import * as axiosModule from '../../../lib/axios.ts';
import { apiClient, clearAuthSessionTokens, getStoredAccessToken, getStoredCsrfToken } from '../../../lib/axios.ts';
import { authService } from './authService.ts';

const localStorageMock = {
  store: new Map<string, string>(),
  getItem(key: string) {
    return this.store.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    this.store.set(key, value);
  },
  removeItem(key: string) {
    this.store.delete(key);
  },
  clear() {
    this.store.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

const originalGet = apiClient.get.bind(apiClient);
const originalPost = apiClient.post.bind(apiClient);

afterEach(() => {
  apiClient.get = originalGet;
  apiClient.post = originalPost;
  clearAuthSessionTokens();
  localStorage.clear();
});

test('admin login stores the backend access and csrf tokens in memory', async () => {
  apiClient.post = (async (url: string, payload?: unknown) => {
    assert.equal(url, '/api/v1/auth/login');
    assert.deepEqual(payload, {
      email: 'admin@example.test',
      password: 'password-123',
    });

    return {
      data: {
        accessToken: 'admin-access-token',
        csrfToken: 'admin-csrf-token',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.test',
          role: 'admin',
        },
      },
    } 
  }) as typeof apiClient.post;

  const result = await authService.login({
    email: 'admin@example.test',
    password: 'password-123',
    rememberMe: false,
  });

  assert.equal(result.role, 'admin');
  assert.equal(result.badgeId, 'ADMIN-OPS-01');
  assert.equal(getStoredAccessToken(), 'admin-access-token');
  assert.equal(getStoredCsrfToken(), 'admin-csrf-token');
});

test('organizer login remembers the email only when requested', async () => {
  apiClient.post = (async () => ({
    data: {
      accessToken: 'organizer-access-token',
      csrfToken: 'organizer-csrf-token',
      user: {
        id: 'user-2',
        name: 'Organizer User',
        email: 'organizer@example.test',
        role: 'organizer',
      },
    },
  })) as typeof apiClient.post;

  await authService.login({
    email: ' Organizer@Example.Test ',
    password: 'secure-pass',
    rememberMe: true,
  });

  assert.equal(localStorage.getItem('nasa_remembered_email'), 'Organizer@Example.Test');
});

test('session restoration requests csrf before refresh and restores the user', async () => {
  let getCalls = 0;
  let postCalls = 0;

  apiClient.get = (async (url: string) => {
    getCalls += 1;
    assert.equal(url, '/api/v1/auth/csrf');
    return { data: { csrfToken: 'recovered-csrf' } } ;
  }) as typeof apiClient.get;

  apiClient.post = (async (url: string) => {
    postCalls += 1;
    assert.equal(url, '/api/v1/auth/refresh');
    return {
      data: {
        accessToken: 'restored-access-token',
        csrfToken: 'restored-csrf',
        user: {
          id: 'user-3',
          name: 'Restored User',
          email: 'restored@example.test',
          role: 'organizer',
        },
      },
    } ;
  }) as typeof apiClient.post;

  const session = await authService.getCurrentSession();

  assert.equal(getCalls, 1);
  assert.equal(postCalls, 1);
  assert.equal(session?.email, 'restored@example.test');
  assert.equal(getStoredAccessToken(), 'restored-access-token');
  assert.equal(getStoredCsrfToken(), 'restored-csrf');
});

test('invalid credentials reject with the backend error message', async () => {
  apiClient.post = (async () => {
    throw {
      response: {
        status: 401,
        data: {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Wrong email and password combination.',
          },
        },
      },
    } ;
  }) as typeof apiClient.post;

  await assert.rejects(
    () => authService.login({ email: 'nope@example.test', password: 'bad-pass' }),
    /Wrong email and password combination\./
  );
});

test('logout clears the in-memory auth state and calls the backend endpoint', async () => {
  clearAuthSessionTokens();
  axiosModule.setAuthSessionTokens({ accessToken: 'access-token', csrfToken: 'csrf-token' });

  apiClient.post = (async (url: string, _payload?: unknown, config?: { headers?: Record<string, string> }) => {
    assert.equal(url, '/api/v1/auth/logout');
    assert.equal(config?.headers?.['X-CSRF-Token'], 'csrf-token');
    return { data: { message: 'Logged out.' } } ;
  }) as typeof apiClient.post;

  await authService.logout();

  assert.equal(getStoredAccessToken(), null);
  assert.equal(getStoredCsrfToken(), null);
});
