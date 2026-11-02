import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { receiveMedia } from './media-upload.js';
import { MEDIA_LIMITS, validateMediaFile } from '../../shared/media.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZqkAAAAASUVORK5CYII=', 'base64');
function request(body = png, headers = {}) {
  const req = Readable.from([body]);
  req.headers = { 'content-type': 'image/png', ...headers };
  return req;
}
const input = { kind: 'image', filename: 'ảnh du lịch.png', landmarkId: 'ben-thanh-market' };

test('local upload preserves bytes, returns playable URL and unique server-generated paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'guide-upload-'));
  try {
    const config = { root, env: { STORAGE_MODE: 'local', STORAGE_PUBLIC_BASE_URL: 'http://localhost:3002/media/' } };
    const first = await receiveMedia(request(), input, config);
    const second = await receiveMedia(request(), { ...input, filename: '../../evil.png' }, config);
    assert.match(first.key, /^images\/ben-thanh-market\/[0-9a-f-]+\.png$/);
    assert.notEqual(first.key, second.key);
    assert.equal(first.url, `http://localhost:3002/media/${first.key}`);
    assert.deepEqual(await readFile(path.join(root, first.key)), png);
    assert.equal((await readdir(path.join(root, 'images', input.landmarkId))).length, 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rejects empty, mismatched MIME, unsupported type and spoofed extension', async () => {
  await assert.rejects(receiveMedia(request(Buffer.alloc(0)), input), { status: 400 });
  await assert.rejects(receiveMedia(request(png, { 'content-type': 'audio/mpeg' }), input), { status: 400 });
  await assert.rejects(receiveMedia(request(), { ...input, filename: 'x.svg' }), { status: 400 });
  await assert.rejects(receiveMedia(request(Buffer.from('<script>alert(1)</script>')), input), { status: 415 });
  await assert.rejects(receiveMedia(request(), { ...input, landmarkId: '../other' }), { status: 403 });
});

test('rejects excessive declared size and excessive chunked body before storage', async () => {
  await assert.rejects(receiveMedia(request(png, { 'content-length': MEDIA_LIMITS.image + 1 }), input), { status: 413 });
  await assert.rejects(receiveMedia(request(Buffer.alloc(MEDIA_LIMITS.image + 1)), input), { status: 413 });
});

test('audio MIME aliases and size limits are shared with browser', () => {
  assert.equal(validateMediaFile('audio', 'recording.WAV', 100, 'audio/x-wav').contentType, 'audio/wav');
  assert.throws(() => validateMediaFile('image', 'cover.png', MEDIA_LIMITS.image + 1));
  assert.throws(() => validateMediaFile('audio', 'cover.png', 100));
});

const cloud = { STORAGE_MODE: 'cloud', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-secret', SUPABASE_IMAGE_BUCKET: 'image', SUPABASE_AUDIO_BUCKET: 'audio' };
test('cloud upload sends binary bytes and server credential to configured bucket only', async () => {
  const result = await receiveMedia(request(), input, { env: cloud, fetchImpl: async (url, options) => {
    assert.match(url, /^https:\/\/example.supabase.co\/storage\/v1\/object\/image\/ben-thanh-market\/[0-9a-f-]+\.png$/);
    assert.equal(options.headers.Authorization, 'Bearer server-secret');
    assert.equal(options.headers['x-upsert'], 'false');
    assert.equal(options.headers['Content-Type'], 'image/png');
    assert.deepEqual(options.body, png);
    return new Response('{}', { status: 200 });
  } });
  assert.match(result.url, /\/object\/public\/image\//);
  assert.ok(!JSON.stringify(result).includes('server-secret'));
});

test('cloud configuration, rejection and network failures have useful safe errors', async () => {
  await assert.rejects(receiveMedia(request(), input, { env: { STORAGE_MODE: 'cloud' } }), { status: 503 });
  await assert.rejects(receiveMedia(request(), input, { env: cloud, fetchImpl: async () => new Response('sensitive upstream detail', { status: 403 }) }), (error) => error.status === 502 && !error.message.includes('sensitive'));
  await assert.rejects(receiveMedia(request(), input, { env: cloud, fetchImpl: async () => { throw new Error('network'); } }), { status: 502 });
});


test('binary HTTP endpoint returns success and 413 for an oversized chunked request', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'guide-upload-http-'));
  const server = http.createServer(async (req, res) => {
    try {
      const data = await receiveMedia(req, input, { root, env: { STORAGE_PUBLIC_BASE_URL: 'http://localhost/media' } });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data }));
    } catch (error) { res.writeHead(error.status ?? 500); res.end(error.message); }
    finally { req.resume(); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: png });
    assert.equal(response.status, 201);
    assert.deepEqual(await readFile(path.join(root, (await response.json()).data.key)), png);
    const oversized = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: Readable.from([Buffer.alloc(MEDIA_LIMITS.image + 1)]), duplex: 'half' });
    assert.equal(oversized.status, 413);
    await oversized.text();
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
