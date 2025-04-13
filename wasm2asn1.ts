import { Bind, bytes2stdout, IO, Lift, stdin2bytes } from "./io.ts";

import { wasm2ber } from "./wasm.ts";

const iwasm: IO<Uint8Array> = stdin2bytes();

const iwber: IO<Uint8Array> = Bind(
  iwasm,
  Lift(wasm2ber),
);

const wasm2info2ber2stdout: IO<void> = Bind(
  iwber,
  bytes2stdout,
);

const main: IO<void> = wasm2info2ber2stdout;

Promise.resolve()
  .then((_) => main())
  .then(console.info);
