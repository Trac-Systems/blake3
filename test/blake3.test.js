const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const artifactPath = path.resolve(__dirname, '../dist/wasm/blake3.js');

if (!fs.existsSync(artifactPath)) {
  throw new Error(
    'BLAKE3 WASM artifact not found. Please run `npm run build` before running tests.',
  );
}

const { blake3 } = require('../dist/wasm/blake3');

const toHex = (uint8Arr) =>
  Array.from(uint8Arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const raw = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './vectors/blake3_test_vectors.json'), 'utf8'),
);

const testVectors = raw.cases.map((v) => ({
  inputLen: v.input_len,
  expected: v.hash,
}));

describe('BLAKE3 official test vectors', function () {
  this.timeout(20000);

  testVectors.forEach(({ inputLen, expected }, index) => {
    it(`vector #${index} (input_len=${inputLen}) should match official hash`, async () => {
      const input = new Uint8Array(inputLen);
      for (let i = 0; i < inputLen; i++) {
        input[i] = i % 251;
      }

      const hash = await blake3(input, expected.length / 2);
      expect(toHex(hash)).to.equal(expected);
    });
  });
});
