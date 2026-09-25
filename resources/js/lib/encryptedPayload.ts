type JsonPayload = Record<string, unknown>;

function base64UrlToBytes(value: string): Uint8Array {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = window.atob(base64);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function encryptedPayload(data: JsonPayload): Promise<JsonPayload> {
    const key = window.joyConfig?.requestPayloadKey;

    // crypto.subtle hanya tersedia di secure context (HTTPS / localhost). Kalau tidak
    // ada, kirim field apa adanya: middleware DecryptRequestPayload sudah menerima
    // body plain. Membungkusnya dengan base64 sebagai 'encrypted_payload' justru
    // ditolak server (butuh iv/data/tag) dan berakhir 422.
    if (!key || !window.crypto?.subtle) {
        return data;
    }

    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        exactArrayBuffer(base64UrlToBytes(key)),
        { name: 'AES-GCM' },
        false,
        ['encrypt'],
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const encrypted = new Uint8Array(await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        exactArrayBuffer(encoded),
    ));
    const tag = encrypted.slice(encrypted.length - 16);
    const ciphertext = encrypted.slice(0, encrypted.length - 16);

    return {
        encrypted_payload: window.btoa(JSON.stringify({
            iv: bytesToBase64(iv),
            data: bytesToBase64(ciphertext),
            tag: bytesToBase64(tag),
        })),
    };
}
