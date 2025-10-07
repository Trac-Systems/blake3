BLAKE3_SRC = blake3-src/c/blake3.c blake3-src/c/blake3_dispatch.c blake3-src/c/blake3_portable.c blake3-src/c/blake3_sse41.c
PORTABLE_BLAKE3_SRC = blake3-src/c/blake3.c blake3-src/c/blake3_dispatch.c blake3-src/c/blake3_portable.c

EM_WASM_SRC = src/wasm/blake3.c $(BLAKE3_SRC)
EM_PORTABLE_SRC = src/wasm/blake3.c $(PORTABLE_BLAKE3_SRC)

WASM_OUT_CJS = dist/wasm/internal/blake3_wasm.js
WASM_OUT_ESM = dist/wasm/internal/blake3_wasm.mjs
WASM_OUT_PORTABLE = dist/wasm/internal/blake3_wasm_portable.js

define wasm-compile-cjs =
emcc -O3 -msimd128 -msse4.1 $^ -o $@ \
	-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall \
	-Iblake3-src/c -sMODULARIZE=1 -s 'EXPORT_NAME="createBlake3"' \
	-sASSERTIONS=0 \
	-sALLOW_MEMORY_GROWTH=0 \
	-flto \
	-sENVIRONMENT=web,webview,worker,node,shell \
  -Os \
	-DNDEBUG \
	-DIS_WASM -DBLAKE3_NO_AVX512 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_AVX2 \
	-sSINGLE_FILE=1
endef

define wasm-compile-esm =
emcc -O3 -msimd128 -msse4.1 $^ -o $@ \
	-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall \
	-Iblake3-src/c -sMODULARIZE=1 -s 'EXPORT_NAME="createBlake3"' \
	-sASSERTIONS=0 \
	-sALLOW_MEMORY_GROWTH=0 \
	-flto \
	-sENVIRONMENT=web,webview,worker,node,shell \
  -Os \
	-DNDEBUG \
	-DIS_WASM -DBLAKE3_NO_AVX512 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_AVX2 \
	-sSINGLE_FILE=1
endef

define wasm-compile-portable =
emcc -O3 $^ -o $@ \
	-Iblake3-src/c \
	-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall \
	-s WASM=0 \
	-s MINIMAL_RUNTIME=1 \
	-s MODULARIZE=1 -s 'EXPORT_NAME="createBlake3"' \
	-s SINGLE_FILE=1 \
	-s STRICT=1 \
	-s ENVIRONMENT='worker' \
	-DNDEBUG -DBLAKE3_NO_AVX512 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_SSE2 --no-entry
endef

all: dist/wasm/blake3.js dist/wasm/blake3.mjs dist/wasm/blake3_rn.js

$(WASM_OUT_CJS): $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile-cjs)

$(WASM_OUT_ESM): $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile-esm)

$(WASM_OUT_PORTABLE): $(EM_PORTABLE_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile-portable)

dist/wasm/blake3.js: $(WASM_OUT_CJS) src/index.js
	mkdir -p $(dir $@)
	cp src/index.js $@

dist/wasm/blake3.mjs: $(WASM_OUT_ESM) src/index.mjs
	mkdir -p $(dir $@)
	cp src/index.mjs $@

dist/wasm/blake3_rn.js: $(WASM_OUT_PORTABLE) src/index.js
	mkdir -p $(dir $@)
	cp src/index.rn.js $@

clean:
	rm -rf ./build ./dist