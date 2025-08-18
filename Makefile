BLAKE3_SRC = blake3-src/c/blake3.c blake3-src/c/blake3_dispatch.c blake3-src/c/blake3_portable.c blake3-src/c/blake3_sse41.c

EM_WASM_SRC = src/wasm/blake3.c $(BLAKE3_SRC)
EM_WASM_OUT = dist/wasm/blake3.js dist/wasm/blake3.mjs

ALL_OUT = $(EM_WASM_OUT)
WASM_OUT_CJS = dist/wasm/internal/blake3_wasm.js
WASM_OUT_ESM = dist/wasm/internal/blake3_wasm.mjs

define wasm-compile-cjs =
emcc -O3 -msimd128 -msse4.1 $^ -o $@ \
	-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall \
	-Iblake3-src/c -sMODULARIZE -s 'EXPORT_NAME="createBlake3"' \
	-sASSERTIONS=0 \
	-sALLOW_MEMORY_GROWTH=0 \
	-flto \
	-sENVIRONMENT=node \
  -Os \
	-DNDEBUG \
	-DIS_WASM -DBLAKE3_NO_AVX512 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_AVX2 \
	-sSINGLE_FILE=1
endef

define wasm-compile-esm =
emcc -O3 -msimd128 -msse4.1 $^ -o $@ \
	-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall \
	-Iblake3-src/c -sMODULARIZE -s 'EXPORT_NAME="createBlake3"' \
	-sASSERTIONS=0 \
	-sALLOW_MEMORY_GROWTH=0 \
	-flto \
	-sENVIRONMENT=node \
  -Os \
	-DNDEBUG \
	-DIS_WASM -DBLAKE3_NO_AVX512 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_AVX2 \
	-sSINGLE_FILE=1
endef

all: dist/wasm/blake3.js dist/wasm/blake3.mjs

$(WASM_OUT_CJS): $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile-cjs)

$(WASM_OUT_ESM): $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile-esm)

dist/wasm/blake3.js: $(WASM_OUT_CJS) src/index.js
	mkdir -p $(dir $@)
	cp src/index.js $@

dist/wasm/blake3.mjs: $(WASM_OUT_ESM) src/index.mjs
	mkdir -p $(dir $@)
	cp src/index.mjs $@

clean:
	rm -rf ./build ./dist