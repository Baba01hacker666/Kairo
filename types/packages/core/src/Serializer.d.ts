/**
 * Kairo Engine Serialization & Persistence System
 * Provides structured JSON serialization, state versioning, deep cloning, and base64 compression.
 */
export interface SaveStateEnvelope<T = any> {
    version: number;
    timestamp: number;
    checksum: number;
    payload: T;
}
export declare class Serializer {
    static readonly VERSION = 1;
    static serialize<T>(data: T, indent?: boolean): string;
    static deserialize<T>(jsonStr: string): T;
    static createSaveEnvelope<T>(payload: T): SaveStateEnvelope<T>;
    static verifyAndUnwrapSave<T>(envelope: SaveStateEnvelope<T>): {
        valid: boolean;
        payload?: T;
        error?: string;
    };
    static compressToBase64(jsonStr: string): string;
    static decompressFromBase64(encoded: string): string;
    static cloneDeep<T>(obj: T): T;
    static hashString(str: string): number;
    /**
     * Fast XOR Cipher Payload Encryption/Obfuscation for Save State and Code Payload Security
     */
    static encryptPayload(dataStr: string, secretKey?: string): string;
    /**
     * Fast XOR Cipher Payload Decryption/Deobfuscation
     */
    static decryptPayload(encryptedStr: string, secretKey?: string): string;
    /**
     * Lightweight Run-Length Encoding (RLE) Payload Compression
     */
    static compressRLE(str: string): string;
    /**
     * Decode a string produced by compressRLE. Note: the RLE format is ambiguous
     * for payloads containing raw digit characters (digits are parsed as run counts).
     */
    static decompressRLE(str: string): string;
}
