/**
 * Input validation for authentication fields.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_TAG_REGEX = /<[^>]*>/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "E-mail je povinný" };
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { valid: false, error: "E-mail je príliš dlhý" };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Neplatný formát e-mailu" };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Heslo je povinné" };
  }
  if (password.length < 8) {
    return { valid: false, error: "Heslo musí mať aspoň 8 znakov" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Heslo je príliš dlhé" };
  }
  return { valid: true };
}

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Meno je povinné" };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "Meno musí mať aspoň 2 znaky" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Meno je príliš dlhé" };
  }
  if (HTML_TAG_REGEX.test(trimmed)) {
    return { valid: false, error: "Meno nesmie obsahovať HTML značky" };
  }
  return { valid: true };
}
