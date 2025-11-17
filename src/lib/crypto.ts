"use client";

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function importKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
}

export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key);
}

export async function deriveKeyFromString(secret: string): Promise<CryptoKey> {
  const data = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return importKey(hash);
}

export async function encryptMessage(
  key: CryptoKey,
  data: string
): Promise<{ iv: string; ciphertext: string }> {
  const enc = new TextEncoder().encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  return { iv: bufferToBase64url(iv), ciphertext: arrayBufferToBase64url(ct) };
}

export async function decryptMessage(
  key: CryptoKey,
  payload: { iv: string; ciphertext: string }
): Promise<string> {
  const iv = base64urlToUint8Array(payload.iv);
  const ct = base64urlToArrayBuffer(payload.ciphertext);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export async function encryptBytes(
  key: CryptoKey,
  bytes: ArrayBuffer
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { iv: bufferToBase64url(iv), ciphertext: arrayBufferToBase64url(ct) };
}

export async function decryptBytes(
  key: CryptoKey,
  payload: { iv: string; ciphertext: string }
): Promise<ArrayBuffer> {
  const iv = base64urlToUint8Array(payload.iv);
  const ct = base64urlToArrayBuffer(payload.ciphertext);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return pt;
}

function arrayBufferToBase64url(ab: ArrayBuffer): string {
  return bufferToBase64url(new Uint8Array(ab));
}

function bufferToBase64url(buf: Uint8Array): string {
  let s = '';
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlToArrayBuffer(s: string): ArrayBuffer {
  return base64urlToUint8Array(s).buffer as ArrayBuffer; // cast for TS strict
}

function base64urlToUint8Array(s: string): Uint8Array {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b.length % 4 ? '='.repeat(4 - (b.length % 4)) : '';
  const bin = atob(b + pad);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
