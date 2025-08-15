const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../dist/wasm/blake3.js');
if (!fs.existsSync(artifactPath)) {
  throw new Error('BLAKE3 WASM artifact not found. Please run `npm run build` first.');
}

const { expect } = require('chai');
const { blake3 } = require('../src/index');

const toHex = (uint8Arr) =>
  Array.from(uint8Arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

describe('blake3 hashing', function () {
  this.timeout(5000);

  const input = 'BLAKE3';
  const lengthsToTest = [16, 32, 48, 64];

  lengthsToTest.forEach((len) => {
    it(`should return a hash of length ${len} bytes`, async () => {
      const hash = await blake3(input, len);
      expect(hash).to.be.instanceOf(Uint8Array);
      expect(hash.length).to.equal(len);
      console.log(`Length ${len}: ${toHex(hash)}`);
    });
  });

  it('should produce the same output for the same input and length', async () => {
    const hash1 = await blake3(input, 32);
    const hash2 = await blake3(input, 32);
    expect(toHex(hash1)).to.equal(toHex(hash2));
  });

  it('should produce different outputs for different lengths', async () => {
    const hash32 = await blake3(input, 32);
    const hash64 = await blake3(input, 64);
    expect(toHex(hash32)).to.not.equal(toHex(hash64));
  });
});
