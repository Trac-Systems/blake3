const createBlake3 = require('./internal/blake3_wasm')

const DEFAULT_LENGTH = 32

let wasm

const stringToBytes = str => {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return bytes
}

const getWasm = async () => {
  // if (wasm) return wasm
  wasm = await createBlake3()
  return wasm
}

module.exports.blake3 = async (input, hashLength = DEFAULT_LENGTH) => {
  const wasm = await getWasm()

  const bytes = stringToBytes(input)
  const ptr = wasm._malloc(bytes.length)

  wasm.HEAPU8.set(bytes, ptr)
  const outputAddr = wasm._malloc(hashLength)

  wasm.ccall(
    'hash',
    null,
    ['number', 'number', 'number', 'number'],
    [ptr, bytes.length, outputAddr, hashLength],
  )

  const res = wasm.HEAPU8.subarray(outputAddr, outputAddr + hashLength)
  wasm._free(outputAddr)
  wasm._free(bytes)
  return res
}