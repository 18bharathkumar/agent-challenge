import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { redis } from "./memory";

export const solanaBalanceTool = createTool({
  id: "solana-balance",
  description: "Check the SOL balance of a Solana address.",
  inputSchema: z.object({
    address: z.string().describe("Solana wallet address"),
  }),
  outputSchema: z.object({
    balance: z.number().describe("Balance in SOL"),
  }),
  execute: async ({ context }) => {
    const connection = new Connection(clusterApiUrl("devnet"));
    let balance = 0;
    try {
      const pubkey = new PublicKey(context.address);
      const lamports = await connection.getBalance(pubkey);
      balance = lamports / LAMPORTS_PER_SOL;
    } catch (e) {
      throw new Error("Invalid Solana address or network error");
    }
    return { balance };
  },
});


// Tool to save a public key to Redis under a user-specified name
export const savePublicKeyTool = createTool({
  id: "save-public-key",
  description: "Save a Solana public key to Redis under a user-specified name.",
  inputSchema: z.object({
    name: z.string().describe("Name to associate with the public key"),
    publicKey: z.string().describe("Solana public key to save"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { name, publicKey } = context;
    // Validate public key
    try {
      new PublicKey(publicKey);
    } catch {
      return { success: false, message: "Invalid Solana public key." };
    }
    await redis.hset("namedKeys", name, publicKey);
    return { success: true, message: `Saved public key for '${name}'.` };
  },
});

// Tool to resolve a name to a public key (or return the input if it's already a valid public key)
export const resolvePublicKeyTool = createTool({
  id: "resolve-public-key",
  description: "Given a name or public key, return the associated public key. If a name is provided, fetch from Redis. If a valid public key is provided, return it directly.",
  inputSchema: z.object({
    nameOrKey: z.string().describe("A saved name or a Solana public key"),
  }),
  outputSchema: z.object({
    publicKey: z.string().describe("Resolved Solana public key"),
  }),
  execute: async ({ context }) => {
    const { nameOrKey } = context;
    // If it's a valid public key, return it
    try {
      new PublicKey(nameOrKey);
      return { publicKey: nameOrKey };
    } catch {
      // Not a valid public key, try to fetch from Redis
      const found = await redis.hget("namedKeys", nameOrKey);
      if (!found) throw new Error(`No public key found for name '${nameOrKey}'.`);
      return { publicKey: found };
    }
  },
});

// 1. Save user public key with name in Redis (no duplicate names)
export const saveUserPublicKeyTool = createTool({
  id: "save-user-public-key",
  description: "Save a Solana public key to Redis under a user-specified name. Fails if the name or public key already exists (case-insensitive).",
  inputSchema: z.object({
    name: z.string().describe("Name to associate with the public key"),
    publicKey: z.string().describe("Solana public key to save"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    let { name, publicKey } = context;
    // Validate public key
    console.log("public key",publicKey);
    console.log("name",name)
    let normalizedPublicKey;
    try {
      normalizedPublicKey = new PublicKey(publicKey);
    } catch(e) {
      console.log("e",e);
      return { success: false, message: "Invalid Solana public key." };
    }
    // Normalize name for case-insensitive check
    const normalizedName = name.trim().toLowerCase();
    // Get all saved keys
    const allNamedKeys = await redis.hgetall("namedKeys");
    // Check for duplicate name (case-insensitive)
    for (const existingName in allNamedKeys) {
      if (existingName.toLowerCase() === normalizedName) {
        return { success: false, message: `Name '${name}' already exists. Please choose a different name.` };
      }
    }
    // Check for duplicate public key 
    for (const [existingName, existingKey] of Object.entries(allNamedKeys)) {
      const existing = new PublicKey(existingKey)
      if (existing === normalizedPublicKey) {
        return { success: false, message: `This public key is already saved with the name "${existingName}".` };
      }
    }
    // Save with original name and normalized public key
    await redis.hset("namedKeys", name, normalizedPublicKey.toString());
    return { success: true, message: `The public key ${normalizedPublicKey.toString()} has been saved with the name "${name}".` };
  },
});

// 2. Check balance by public key
export const checkBalanceByPublicKeyTool = createTool({
  id: "check-balance-by-public-key",
  description: "Check the SOL balance of a given Solana public key.",
  inputSchema: z.object({
    publicKey: z.string().describe("Solana public key to check balance for"),
  }),
  outputSchema: z.object({
    balance: z.number().describe("Balance in SOL"),
  }),
  execute: async ({ context }) => {
    const { publicKey } = context;
    const connection = new Connection(clusterApiUrl("devnet"));
    let balance = 0;
    try {
      const pubkey = new PublicKey(publicKey);
      const lamports = await connection.getBalance(pubkey);
      balance = lamports / LAMPORTS_PER_SOL;
    } catch (e) {
      throw new Error("Invalid Solana public key or network error");
    }
    return { balance };
  },
});

// 3. Check balance by name (resolve from Redis, then check balance)
export const checkBalanceByNameTool = createTool({
  id: "check-balance-by-name",
  description: "Check the SOL balance for a user by name. Resolves the public key from Redis, then checks the balance.",
  inputSchema: z.object({
    name: z.string().describe("Name associated with the public key"),
  }),
  outputSchema: z.object({
    balance: z.number().describe("Balance in SOL"),
    publicKey: z.string().describe("Resolved Solana public key"),
  }),
  execute: async ({ context }) => {
    const { name } = context;
    const publicKey = await redis.hget("namedKeys", name);
    console.log("name",name);
    console.log("public key",publicKey)
    if (!publicKey) {
      throw new Error(`No public key found for name '${name}'.`);
    }
    const connection = new Connection(clusterApiUrl("devnet"));
    let balance = 0;
    try {
      const pubkey = new PublicKey(publicKey);
      const lamports = await connection.getBalance(pubkey);
      balance = lamports / LAMPORTS_PER_SOL;
    } catch (e) {
      throw new Error("Invalid Solana public key or network error");
    }
    return { balance, publicKey };
  },
});

// 4. Send SOL to a given public key
export const sendSolToPublicKeyTool = createTool({
  id: "send-sol-to-public-key",
  description: "Send SOL to a given Solana public key.",
  inputSchema: z.object({
    amount: z.number().describe("Amount of SOL to send"),
    to: z.string().describe("Recipient Solana public key"),
  }),
  outputSchema: z.object({
    signature: z.string().describe("Transaction signature"),
  }),
  execute: async ({ context }) => {
    const { to, amount } = context;
    const secret = process.env.SOL_PRIVATE_KEY;
    if (!secret) throw new Error("Private key not set in environment (SOL_PRIVATE_KEY)");
    let secretKey;
    try {
      secretKey = bs58.decode(secret);
    } catch {
      throw new Error("Invalid base58 private key in SOL_PRIVATE_KEY");
    }
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    const connection = new Connection(clusterApiUrl("devnet"));
    let signature;
    try {
      const toPubkey = new PublicKey(to);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );
      signature = await sendAndConfirmTransaction(connection, tx, [fromKeypair]);
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error("Failed to send SOL: " + e.message);
      } else {
        throw new Error("Failed to send SOL: " + String(e));
      }
    }
    return { signature };
  },
});

// 5. Send SOL to a user by name (resolve from Redis, then send)
export const sendSolToNameTool = createTool({
  id: "send-sol-to-name",
  description: "Send SOL to a user by name. Resolves the public key from Redis, then sends SOL.",
  inputSchema: z.object({
    name: z.string().describe("Name associated with the public key"),
    amount: z.number().describe("Amount of SOL to send"),
  }),
  outputSchema: z.object({
    signature: z.string().describe("Transaction signature"),
    publicKey: z.string().describe("Resolved Solana public key"),
  }),
  execute: async ({ context }) => {
    const { name, amount } = context;
    const publicKey = await redis.hget("namedKeys", name);
    console.log("public key",publicKey)
    if (!publicKey) {
      throw new Error(`No public key found for name '${name}'.`);
    }
    const secret = process.env.SOL_PRIVATE_KEY;
    if (!secret) throw new Error("Private key not set in environment (SOL_PRIVATE_KEY)");
    let secretKey;
    try {
      secretKey = bs58.decode(secret);
    } catch {
      throw new Error("Invalid base58 private key in SOL_PRIVATE_KEY");
    }
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    const connection = new Connection(clusterApiUrl("devnet"));
    let signature;
    try {
      const toPubkey = new PublicKey(publicKey);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );
      signature = await sendAndConfirmTransaction(connection, tx, [fromKeypair]);
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error("Failed to send SOL: " + e.message);
      } else {
        throw new Error("Failed to send SOL: " + String(e));
      }
    }
    return { signature, publicKey };
  },
});

// Tool to check if a name is saved in Redis and return the associated public key
export const checkNameExistsTool = createTool({
  id: "check-name-exists",
  description: "Check if a name is saved in Redis and return the associated public key if it exists.",
  inputSchema: z.object({
    name: z.string().describe("Name to check in Redis"),
  }),
  outputSchema: z.object({
    exists: z.boolean(),
    publicKey: z.string().nullable().describe("Associated public key if exists, otherwise null"),
  }),
  execute: async ({ context }) => {
    const { name } = context;
    const publicKey = await redis.hget("namedKeys", name);
    if (publicKey) {
      return { exists: true, publicKey };
    } else {
      return { exists: false, publicKey: null };
    }
  },
});

// Tool to get all saved names and their associated public keys from Redis
export const getAllSavedPublicKeysTool = createTool({
  id: "get-all-saved-public-keys",
  description: "Get all saved names and their associated public keys from Redis.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    namedKeys: z.record(z.string(), z.string()).describe("Mapping of name to public key"),
  }),
  execute: async () => {
    const namedKeys = await redis.hgetall("namedKeys");
    return { namedKeys };
  },
});

export const checkMybalance = createTool({
  id: "check my balance",
  description: "check the solana balance of me",
  inputSchema: z.object({}),
  outputSchema: z.object({
    balance: z.number().describe("Balance in SOL"),
  }),
  execute: async () => {
   const publicKey = "4DfsaqofmavMUTjhZnpUd8CRYiTeMSVrY4P8h9XyQaX7"
    const connection = new Connection(clusterApiUrl("devnet"));
    let balance = 0;
    try {
      const pubkey = new PublicKey(publicKey);
      const lamports = await connection.getBalance(pubkey);
      balance = lamports / LAMPORTS_PER_SOL;
    } catch (e) {
      throw new Error("Invalid Solana public key or network error");
    }
    return { balance };
  },
});
