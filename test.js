const createBlake3 = require('./dist/wasm/blake3.js');
const viem = require('viem');

(async () => {
  const input = "abc"
  const bytes = viem.stringToBytes(input)
  const hashLength = 32
  const wasm = await createBlake3()

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
  wasm._free(hashAddr)
})();