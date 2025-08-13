TARGETS=nodejs browser web
MODE=dev

BLAKE3_SRC = blake3-src/c/blake3.c blake3-src/c/blake3_dispatch.c blake3-src/c/blake3_portable.c blake3-src/c/blake3_sse41.c

EM_WASM_SRC = src/wasm/blake3.c $(BLAKE3_SRC)
EM_WASM_OUT = dist/wasm/blake3.js esm/wasm/blake3.mjs

ALL_OUT = $(EM_WASM_OUT)

define wasm-compile =
emcc -O3 -msimd128 -msse4.1 $^ -o $@ \
		-sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall -Iblake3-src/c -sMODULARIZE -s 'EXPORT_NAME="createMyModule"' \
		-sASSERTIONS=0 --profiling \
		-DIS_WASM -DBLAKE3_NO_AVX512 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_AVX2 -sENVIRONMENT="web,node" -sSINGLE_FILE=1
endef

all: $(ALL_OUT)

dist/wasm/blake3.js: $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile)

esm/wasm/blake3.mjs: $(EM_WASM_SRC)
	mkdir -p $(dir $@)
	$(wasm-compile)

test: $(ALL_OUT)
	cd blake3 && node ../node_modules/.bin/mocha "*.test.cjs" --timeout 5000 $(TEST_ARGS)

clean:
	rm -rf ./build ./dist ./esm

fmt:
	node ./node_modules/.bin/remark readme.md -f -o readme.md
	node ./node_modules/.bin/prettier --write "ts/**/*.ts" "*.md"

pack:
	npm pack -w blake3 -w blake3-native -w blake3-internal -w blake3-wasm

.PHONY: all clean test fmt get-native pack
