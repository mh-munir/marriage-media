import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from './route';

test('GET /api/locations should not fail with a 502 when upstream fetches are unavailable', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('upstream unavailable');
  };

  try {
    const response = await GET(new NextRequest('http://localhost/api/locations?level=labels'));
    const payload = await response.json();

    assert.equal(response.status, 200, 'should return success even if upstream sources are unavailable');
    assert.ok(payload && typeof payload === 'object', 'should return JSON payload');
  } finally {
    global.fetch = originalFetch;
  }
});
