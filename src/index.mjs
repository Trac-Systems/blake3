import wasm from './internal/blake3_wasm.mjs'

const DEFAULT_LENGTH = 32
let wasm

const getWasm = async () => {
  if (wasm) return wasm
  wasm = await createBlake3()
  return wasm
}

export const blake3 = async (bytes, hashLength = DEFAULT_LENGTH) => {
  const wasm = await getWasm()
  const inputAddr = wasm._malloc(bytes.length)

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
  wasm._free(inputAddr)
  return res
}
