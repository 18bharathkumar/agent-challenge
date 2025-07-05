import { PublicKey } from "@solana/web3.js";
import { redis } from "./memory";

/**
 * Checks if a string is a valid Solana public key.
 */
export function isValidSolanaPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts a Solana public key string to a Buffer.
 */
export function getPublicKeyBuffer(key: string): Buffer {
  return new PublicKey(key).toBuffer();
}

/**
 * Gets a saved public key from Redis by name.
 */
export async function getSavedPublicKeyByName(name: string): Promise<string | null> {
  return await redis.hget("namedKeys", name);
}

/**
 * Gets all saved public keys from Redis as a mapping of name to public key.
 */
export async function getAllSavedPublicKeys(): Promise<Record<string, string>> {
  return await redis.hgetall("namedKeys");
} 