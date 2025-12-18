const fs = require('fs');
const path = require('path');

let expect; // chai's expect will be loaded dynamically

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

  // Load chai here, since it's ESM-only
  before(async () => {
    ({ expect } = await import('chai'));
  });

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

describe('BLAKE3 WASM memory safety / concurrency', function () {
  this.timeout(20000);

  before(async () => {
    ({ expect } = await import('chai'));
  });

  it('should return a copy (hash buffers must not share the same ArrayBuffer)', async () => {
    const a = new Uint8Array(1024);
    const b = new Uint8Array(1024);
    for (let i = 0; i < a.length; i++) a[i] = i % 251;
    for (let i = 0; i < b.length; i++) b[i] = (i * 7) % 251;

    const h1 = await blake3(a, 32);
    const h2 = await blake3(b, 32);

    expect(h1).to.be.instanceof(Uint8Array);
    expect(h2).to.be.instanceof(Uint8Array);

    expect(h1.buffer).to.not.equal(h2.buffer);
  });

  it('concurrent hashing should match sequential hashing', async () => {
    const inputs = Array.from({ length: 50 }, (_, i) => {
      const u8 = new Uint8Array(2048);
      u8[0] = i;
      for (let j = 1; j < u8.length; j++) u8[j] = (j + i) % 251;
      return u8;
    });

    const sequential = [];
    for (const inp of inputs) {
      sequential.push(toHex(await blake3(inp, 32)));
    }

    const concurrent = await Promise.all(inputs.map(inp => blake3(inp, 32).then(toHex)));

    expect(concurrent).to.deep.equal(sequential);
  });
});