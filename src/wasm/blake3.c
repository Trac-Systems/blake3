#include <blake3.h>
#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>

void EMSCRIPTEN_KEEPALIVE hash(const void *input, size_t input_len,
                                       void *out, size_t out_len) {
  blake3_hasher h;
  blake3_hasher_init(&h);
  blake3_hasher_update(&h, input, input_len);
  blake3_hasher_finalize(&h, out, out_len);
}
