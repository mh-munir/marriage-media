const assert = require('node:assert/strict');
const sharp = require('sharp');

(async () => {
  const { normalizeProfileImageBuffer } = await import('../src/lib/image-normalization.ts');

  const source = await sharp({
    create: {
      width: 200,
      height: 300,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();

  const normalized = await normalizeProfileImageBuffer(source);
  const { width, height, orientation } = await sharp(normalized).metadata();

  assert.equal(width, 300);
  assert.equal(height, 200);
  assert.equal(orientation, undefined);
  console.log('profile image normalization test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
