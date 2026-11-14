// lib/crypto-vault.ts
/**
 * Zero-Liability Client-Side Key Storage using Web Crypto API.
 * Encrypts provider API keys (OpenAI / Gemini) with AES-GCM 256-bit
 * using a PBKDF2 key derived from the user's license key.
 * Plaintext keys never touch any backend server or database.
 */

const STORAGE_KEY = "gridvault_enc_api_key";
const SALT_KEY = "gridvault_enc_salt";
const PROVIDER_KEY = "gridvault_active_provider";

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function saveEncryptedApiKey(
  rawApiKey: string,
  licenseKey: string,
  provider: "gemini" | "openai" = "gemini"
): Promise<void> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this environment.");
  }

  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(licenseKey || "gridvault-default-vault-key", salt);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    enc.encode(rawApiKey.trim())
  );

  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };

  localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  localStorage.setItem(PROVIDER_KEY, provider);
}

export async function loadDecryptedApiKey(licenseKey: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return null;
  }

  const rawPayload = localStorage.getItem(STORAGE_KEY);
  const rawSalt = localStorage.getItem(SALT_KEY);
  if (!rawPayload || !rawSalt) return null;

  try {
    const { iv, data } = JSON.parse(rawPayload);
    const salt = new Uint8Array(JSON.parse(rawSalt));
    const key = await deriveKey(licenseKey || "gridvault-default-vault-key", salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) as unknown as BufferSource },
      key,
      new Uint8Array(data) as unknown as BufferSource
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("Failed to decrypt API key:", err);
    return null;
  }
}

export function getSavedProvider(): "gemini" | "openai" {
  if (typeof window === "undefined") return "gemini";
  return (localStorage.getItem(PROVIDER_KEY) as "gemini" | "openai") || "gemini";
}

export function clearEncryptedApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(PROVIDER_KEY);
}
