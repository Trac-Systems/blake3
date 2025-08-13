const createBlake3 = require('./dist/wasm/blake3.js');

(async () => {
  const input = "life"
  const hashLength = 32
  const wasm = await createBlake3(); // No filesystem access, wasm is inside

  const hashAddr = wasm._malloc(hashLength)

  wasm.ccall(
    'hash_oneshot',
    null,
    ['number', 'number', 'number', 'number'],
    [input, input.length, hashAddr, hashLength],
  );

  console.log(hashAddr)
  // kinda use after free, but as long as we (internal caller) consumes it
  // synchronously, it's fine.
  console.log(wasm.HEAPU8.subarray(hashAddr, hashAddr + hashLength));
})();