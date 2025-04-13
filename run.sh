#!/bin/sh

input=./sample.d/input.wasm

output=./sample.d/output.asn1.ber.dat

geninput() {
	echo generating input wasm file...

	mkdir -p sample.d

	wat2wasm \
		"./sample.d/input.wat" \
		--output "${input}"
}

test -f "${input}" || geninput

echo 'writing wasm module info as asn.1 ber...'
cat "${input}" |
	deno \
		run \
		wasm2asn1.ts |
	dd \
		if=/dev/stdin \
		of="${output}" \
		status=none

ofmt=toml
ofmt=yaml

echo
echo 'printing ber using asn1tools/dasel/bat...'
cat "${output}" |
	python3 ber2json.py |
	dasel \
		--read=json \
		--write=$ofmt |
	bat --language=$ofmt
