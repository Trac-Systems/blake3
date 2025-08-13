const createBlake3 = require('./dist/wasm/blake3.js');
const viem = require('viem');

(async () => {
  const input = "life"
  const hashLength = 128
  const wasm = await createBlake3(); // No filesystem access, wasm is inside

  const hashAddr = wasm._malloc(hashLength)

  wasm.ccall(
    'hash',
    null,
    ['number', 'number', 'number', 'number'],
    [input, input.length, hashAddr, hashLength],
  );

  // kinda use after free, but as long as we (internal caller) consumes it
  // synchronously, it's fine.
  const res = wasm.HEAPU8.subarray(hashAddr, hashAddr + hashLength);
  wasm._free(hashAddr);
  console.log(viem.bytesToHex(res))
})();