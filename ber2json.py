import json
import sys

import asn1tools

wasn = asn1tools.compile_files("./wasm.asn")

encoded = sys.stdin.buffer.read()
decoded = wasn.decode(
  "SimpleWasmInfo",
  encoded,
)

print(json.dumps(dict(
  exports = decoded["exports"],
  imports = decoded["imports"],
)))
