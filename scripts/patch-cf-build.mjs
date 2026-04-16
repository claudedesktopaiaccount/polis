/**
 * Post-build patch: inject globals polyfills into handler.mjs
 *
 * undici v7 references several JS globals at module evaluation time
 * (`MessagePort`, `FinalizationRegistry`, `WeakRef`). Cloudflare Workers
 * (and local Miniflare) don't expose some of these — this patch stubs
 * them before the bundle evaluates. The stubs are no-ops; undici's
 * FinalizationRegistry usage is purely for stream GC cleanup, which
 * Workers handles via isolate lifecycle instead.
 */
import { readFileSync, writeFileSync } from "fs";

const HANDLER = ".open-next/server-functions/default/handler.mjs";
const SENTINEL = "/* polis-cf-polyfills */";
const POLYFILL =
  SENTINEL +
  'if(typeof globalThis.MessagePort==="undefined"){globalThis.MessagePort=class MessagePort{};}' +
  'if(typeof globalThis.FinalizationRegistry==="undefined"){globalThis.FinalizationRegistry=class FinalizationRegistry{register(){}unregister(){}};}' +
  'if(typeof globalThis.WeakRef==="undefined"){globalThis.WeakRef=class WeakRef{constructor(t){this._t=t}deref(){return this._t}};}' +
  "\n";

const content = readFileSync(HANDLER, "utf8");
if (!content.startsWith(SENTINEL)) {
  // Strip any previous (older) polyfill header so we don't stack them.
  const stripped = content.replace(
    /^if\(typeof globalThis\.MessagePort[^\n]*\n/,
    ""
  );
  writeFileSync(HANDLER, POLYFILL + stripped);
  console.log("✔ Patched handler.mjs with globals polyfill");
} else {
  console.log("✔ handler.mjs already patched");
}
