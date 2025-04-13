import * as asn1js from "npm:asn1js";

import { Compose } from "./io.ts";

type WasmBytesToModule = (bytes: Uint8Array) => Promise<WebAssembly.Module>;

const wasm2module: WasmBytesToModule = (
  wasm: Uint8Array,
): Promise<WebAssembly.Module> => {
  return Promise.resolve(wasm)
    .then((bytes: Uint8Array) => WebAssembly.compile(bytes));
};

interface ExportedItem {
  name: string;
  kind: string;
}

function eitem2asn1(eitem: ExportedItem): Promise<asn1js.Sequence> {
  return Promise.resolve()
    .then((_) => {
      return new asn1js.Sequence({
        value: [
          new asn1js.IA5String({ value: eitem.name }),
          new asn1js.IA5String({ value: eitem.kind }),
        ],
      });
    });
}

interface ImportedItem {
  module: string;
  name: string;
  kind: string;
}

function iitem2asn1(iitem: ImportedItem): Promise<asn1js.Sequence> {
  return Promise.resolve()
    .then((_) => {
      return new asn1js.Sequence({
        value: [
          new asn1js.IA5String({ value: iitem.module }),
          new asn1js.IA5String({ value: iitem.name }),
          new asn1js.IA5String({ value: iitem.kind }),
        ],
      });
    });
}

function edesc2eitem(desc: WebAssembly.ModuleExportDescriptor): ExportedItem {
  return {
    name: desc.name,
    kind: desc.kind,
  };
}

function idesc2eitem(desc: WebAssembly.ModuleImportDescriptor): ImportedItem {
  return {
    module: desc.module,
    name: desc.name,
    kind: desc.kind,
  };
}

function module2exports(mdl: WebAssembly.Module): ExportedItem[] {
  const exports: WebAssembly.ModuleExportDescriptor[] = WebAssembly.Module
    .exports(mdl);
  return exports.map(edesc2eitem);
}

function module2imports(mdl: WebAssembly.Module): ImportedItem[] {
  const imports: WebAssembly.ModuleImportDescriptor[] = WebAssembly.Module
    .imports(mdl);
  return imports.map(idesc2eitem);
}

function module2info(mdl: WebAssembly.Module): WasmInfo {
  return {
    exports: module2exports(mdl),
    imports: module2imports(mdl),
  };
}

interface WasmInfo {
  exports: ExportedItem[];
  imports: ImportedItem[];
}

function winfo2asn1(winf: WasmInfo): Promise<asn1js.Sequence> {
  return Promise.resolve()
    .then((_) => {
      const peitems: Promise<asn1js.Sequence[]> = Promise.all(
        winf.exports.map(eitem2asn1),
      );
      const piitems: Promise<asn1js.Sequence[]> = Promise.all(
        winf.imports.map(iitem2asn1),
      );
      const pei: Promise<asn1js.Sequence[][]> = Promise.all([
        peitems,
        piitems,
      ]);
      return pei.then((ei: asn1js.Sequence[][]) => {
        return new asn1js.Sequence({
          value: [
            new asn1js.Sequence({ value: ei[0] }),
            new asn1js.Sequence({ value: ei[1] }),
          ],
        });
      });
    });
}

function asn1tober(asn1: asn1js.Sequence): Promise<ArrayBuffer> {
  return Promise.resolve(asn1)
    .then((asn1: asn1js.Sequence) => asn1.toBER());
}

const winfo2ber: (winf: WasmInfo) => Promise<ArrayBuffer> = Compose(
  winfo2asn1,
  asn1tober,
);

function buf2bytes(buf: ArrayBuffer): Uint8Array {
  return new Uint8Array(buf);
}

const winfo2bytes: (winf: WasmInfo) => Promise<Uint8Array> = Compose(
  winfo2ber,
  (buf: ArrayBuffer): Promise<Uint8Array> => {
    return Promise.resolve(buf).then(buf2bytes);
  },
);

const module2bytes: (mdl: WebAssembly.Module) => Promise<Uint8Array> = Compose(
  (mdl: WebAssembly.Module): Promise<WasmInfo> => {
    return Promise.resolve(mdl).then(module2info);
  },
  winfo2bytes,
);

const wasm2ber: (wasm: Uint8Array) => Promise<Uint8Array> = Compose(
  wasm2module,
  module2bytes,
);

export {
  type ExportedItem,
  type ImportedItem,
  module2exports,
  module2info,
  wasm2ber,
  wasm2module,
  type WasmBytesToModule,
  type WasmInfo,
  winfo2ber,
};
