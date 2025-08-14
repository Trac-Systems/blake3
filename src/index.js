const createBlake3 = require('./internal/blake3_wasm')

let wasm

const getWasm = async () => {
  if (wasm) return wasm
  wasm = await createBlake3()
  return wasm
}

module.exports.blake3 = async input => {
  const hashLength = 32
  const wasm = await getWasm()

  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
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