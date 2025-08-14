import createBlake3 from './dist/wasm/blake3.js';
import * as viem from 'viem';

(async () => {
  const input = "abc"
  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
  const hashLength = 32
  const wasm = await createBlake3(); // No filesystem access, wasm is inside

  const hashAddr = wasm._malloc(hashLength)

  wasm.ccall(
    'hash',
    null,
    ['number', 'number', 'number', 'number'],
    [bytes, bytes.length, hashAddr, hashLength],
  );

  const res = wasm.HEAPU8.subarray(hashAddr, hashAddr + hashLength);
  console.log(res)
  console.log(viem.bytesToHex(res))
  wasm._free(hashAddr);
})();