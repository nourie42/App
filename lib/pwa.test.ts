import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildManifestConfig,
  detectIOSUserAgent,
  getInstallPlatform,
  isStandaloneDisplay,
} from './pwa';

test('detectIOSUserAgent identifies iPhone, iPad, and iPod user agents', () => {
  assert.equal(
    detectIOSUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)'),
    true
  );
  assert.equal(
    detectIOSUserAgent('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'),
    true
  );
  assert.equal(
    detectIOSUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0'),
    false
  );
});

test('getInstallPlatform classifies iOS, Safari Mac, Chromium, and generic browsers', () => {
  assert.equal(getInstallPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)'), 'ios');
  assert.equal(
    getInstallPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'),
    'safari-mac'
  );
  assert.equal(
    getInstallPlatform('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36'),
    'chromium'
  );
  assert.equal(
    getInstallPlatform('Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0'),
    'browser'
  );
});

test('isStandaloneDisplay handles display-mode media query and iOS navigator.standalone', () => {
  assert.equal(isStandaloneDisplay(true, false), true);
  assert.equal(isStandaloneDisplay(false, true), true);
  assert.equal(isStandaloneDisplay(false, false), false);
});

test('buildManifestConfig satisfies PWA installability constraints', () => {
  const manifest = buildManifestConfig();
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.short_name && manifest.short_name.length <= 12);

  const icons = manifest.icons ?? [];
  assert.ok(icons.some((i) => i.sizes === '192x192' && i.purpose === 'any'));
  assert.ok(icons.some((i) => i.sizes === '512x512' && i.purpose === 'any'));
  assert.ok(icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'));
  assert.ok(!icons.some((i) => String(i.purpose) === 'any maskable'));
});
