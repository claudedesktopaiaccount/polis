import { hasConsent } from "@/lib/consent";

/**
 * Lightweight browser fingerprint — standard signals only.
 * Canvas + screen + timezone + platform + languages + hardware.
 * Returns a hex hash string, or empty string if no GDPR consent.
 */
export async function getFingerprint(): Promise<string> {
  if (!hasConsent()) return "";

  const signals: string[] = [];

  // Screen
  signals.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  signals.push(`${screen.availWidth}x${screen.availHeight}`);
  signals.push(`dpr:${window.devicePixelRatio}`);

  // Timezone
  signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  signals.push(`offset:${new Date().getTimezoneOffset()}`);

  // Language
  signals.push(navigator.language);
  signals.push((navigator.languages || []).join(","));

  // Platform / hardware
  signals.push(navigator.platform);
  signals.push(`cores:${navigator.hardwareConcurrency || "?"}`);
  signals.push(`touch:${navigator.maxTouchPoints || 0}`);

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "alphabetic";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(50, 0, 100, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("Polis", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Polis", 4, 35);
      signals.push(canvas.toDataURL());
    }
  } catch {
    signals.push("canvas:error");
  }

  // WebGL renderer
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        signals.push(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL));
        signals.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    signals.push("webgl:error");
  }

  // Hash all signals
  const raw = signals.join("|");
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
